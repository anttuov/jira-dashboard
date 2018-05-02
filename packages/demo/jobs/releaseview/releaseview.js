var querystring = require('querystring'), cache = require('memory-cache');

module.exports = function (config, dependencies, job_callback) {
  var cache_key = "issues-QCAS";
  var issues = {};
  var releaseDates = {};

  cache.keys().forEach(function (key) {
    if (key.startsWith("issues-")) {
      var projectName = key.split("-").pop();
      issues[projectName] = cache.get(key);
      if (releaseDates[issues[projectName].releaseDate] == null) {
        releaseDates[issues[projectName].releaseDate] = [projectName];
      } else {
        releaseDates[issues[projectName].releaseDate].push(projectName);
      }

    }
  });
  var newest_release_date = Object.keys(releaseDates).sort()[0];
  var returnissues = {};
  releaseDates[newest_release_date].forEach(function (project) {
    returnissues[project] = issues[project];
  });


  var authName = config.authName || 'jac';

  config.jql = 'project = YDR';

  if (!config.globalAuth || !config.globalAuth[authName] ||
    !config.globalAuth[authName].username || !config.globalAuth[authName].password) {
    return job_callback('no credentials found in release view  job. Please check global authentication file (usually config.globalAuth)');
  }

  if (!config.jql || !config.jira_server) {
    return job_callback('missing parameters in release view job');
  }

  var logger = dependencies.logger;

  // 
  var params = {
    jql: config.jql,
    maxResults: config.maxResults || 200,
    fields: "key,summary,priority,status,fixVersions"
  };

  var options = {
    timeout: config.timeout || 15000,
    url: config.jira_server + '/rest/api/2/search?' + querystring.stringify(params),
    headers: {
      "authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +
        config.globalAuth[authName].password).toString("base64")
    }
  };
  // cache response
  var cache_expiration = 60 * 1000; //ms
  var cache_key = 'YDR' + JSON.stringify(config); // unique cache object per job config
  if (cache.get(cache_key)) {
    return job_callback(null, { "projects": returnissues, "YDR": cache.get(cache_key) });
  }

  dependencies.easyRequest.JSON(options, function (error, Data) {
    if (error)
      return job_callback(error);

    var result = [];

    Data.issues.forEach(function (issue) {
      var baseUrl = issue.self.substring(0, issue.self.indexOf("/rest/api"));
      if (issue.fields.fixVersions[0] != undefined) {
        if (issue.fields.fixVersions[0].releaseDate == newest_release_date) {


          result.push({
            url: baseUrl + "/browse/" + issue.key,
            issue: issue
          });
        }
      }
    });

    cache.put("YDR", result, cache_expiration);
    return job_callback(null, { "projects": returnissues, "YDR": result });
    job_callback(null, data);

  });



};