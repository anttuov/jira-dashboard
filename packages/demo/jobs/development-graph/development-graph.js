var querystring = require('querystring'),
  cache = require('memory-cache');

module.exports = function (config, dependencies, job_callback) {
  // fallback to for configuration compatibility
  var authName = config.authName || 'jac';

  config.jql = 'project = ' + config.projectName;
  var i = 0;

  if (!config.globalAuth || !config.globalAuth[authName] ||
    !config.globalAuth[authName].username || !config.globalAuth[authName].password) {
    return job_callback('no credentials found in job. Please check global authentication file (usually config.globalAuth)');
  }

  if (!config.jql || !config.jira_server) {
    return job_callback('missing parameters in job');
  }

  var logger = dependencies.logger;

  var params = {
    jql: config.jql,
    maxResults: config.maxResults || 200,
    fields: "id, issuetype, fixVersions"
  };

  var options1 = {
    timeout: config.timeout || 15000,
    url: config.jira_server + '/rest/api/2/search?' + querystring.stringify(params),
    headers: {
      "authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +
        config.globalAuth[authName].password).toString("base64")
    }
  };
  var options2 = [];

  var linkParams = { jql: config.jql };
  var bugsLink = config.jira_server + "/issues/?" + querystring.stringify(linkParams);

  // cache response
  var cache_expiration = 60 * 1000; //ms
  var cache_key = 'atlassian-jira-blockers:config-' + JSON.stringify(config); // unique cache object per job config
  if (cache.get(cache_key)) {
    return job_callback(null, cache.get(cache_key));
  }

  dependencies.easyRequest.JSON(options1, function (error, Data) {
    if (error)
      return job_callback(error);

    var fixversionurl = "";
    var result = [];
    var result2 = [];
    var result3 = [];
    var resultEpics = [];
    var epics = [];

    var i = 0;

    if (!Data.issues)
      Data.issues = [];

    Data.issues.forEach(function (issue) {
      if (issue.fields.fixVersions.length > 0) {
        fixversionurl = issue.fields.fixVersions[0].self;
      }
      result.push({
        id: issue.id,
        type: issue.fields.issuetype,
        total: Data.total
      });
    });
    options3 = {
      timeout: config.timeout || 15000,
      url: fixversionurl,
      headers: {
        "authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +
          config.globalAuth[authName].password).toString("base64")
      }
    };

    dependencies.easyRequest.JSON(options3, function (error, Data) {
      result2.push({
        startDate: Data.startDate,
        releaseDate: Data.releaseDate
      });
    });

    result.forEach(function (index) {
      options2[i] = {
        timeout: config.timeout || 15000,
        url: config.jira_server + '/rest/api/2/issue/' + index.id,
        headers: {
          "authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +
            config.globalAuth[authName].password).toString("base64")
        }
      };
      dependencies.easyRequest.JSON(options2[i], function (error, Data) {

        result3.push({
          worklog: Data.fields.worklog,
          progress: Data.fields.progress,
          id: index.id,
          epic: Data.fields.customfield_10000
        });

        if (Data.fields.customfield_10000) {

          if (epics.indexOf(Data.fields.customfield_10000) === -1) {
            epics.push(Data.fields.customfield_10000);
            var epicsQuery = '/rest/api/2/search?jql=issuekey="' + Data.fields.customfield_10000 + '"';

            optionsEpic = {
              timeout: config.timeout || 15000,
              url: config.jira_server + epicsQuery,
              headers: {
                "authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +
                  config.globalAuth[authName].password).toString("base64")
              }
            };

            dependencies.easyRequest.JSON(optionsEpic, function (error, DataEpic) {
              resultEpics.push({
                summary: DataEpic.issues[0].fields.summary,
                key: DataEpic.issues[0].key
              });
            });
          }
        }
      });
      i++;
    });

    var data = {
      issues: result.length,
      total: result[0].total,
      progress: result3,
      projectLength: result2,
      scrolling: config.scrolling,
      epic: resultEpics,
    };

    cache.put(cache_key, data, cache_expiration);

    setTimeout(endfunc, 500);
    function endfunc() {
      if (result.length == result[0].total && result3.length == result[0].total) {
        return job_callback(null, { dev: data, title: config.widgetTitle, dataDisplay: "" });
      }
      else {
        setTimeout(endfunc, 500);
      }
    }
  });
}