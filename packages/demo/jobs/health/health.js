var querystring = require('querystring'),
    cache = require('memory-cache');

module.exports = function(config, dependencies, job_callback) {
  var jobname = "health";
  var epics = {};
  var authName = config.authName || 'jac';
  config.jql =  'project = '+config.projectName;
  var apitest = require("./../../jira-api");
  var logger = dependencies.logger;
  var fields = "key,assignee,priority,status,progress,fixVersions,customfield_10000,issuetype,project,summary";
  var options = apitest.jiraApiCall(config, dependencies, job_callback, fields, jobname);
  if (options[0] != ""){
    return job_callback(options[0]);
  }
  var options = options[1];
  // cache response
  var cache_expiration = 60 * 1000; //ms
  var cache_key = 'atlassian-jira-health:config-' + JSON.stringify(config); // unique cache object per job config
  if (cache.get(cache_key)){
      return job_callback (null, cache.get(cache_key));
  }

  dependencies.easyRequest.JSON(options, function(error, Data) {
    if (error)
        return job_callback(error);

    var result = [];
    

    if (!Data.issues)
    Data.issues = [];
    var fixversionurl = "";
    Data.issues.forEach(function(issue) {
      var baseUrl = issue.self.substring(0, issue.self.indexOf("/rest/api"));
      var assignee = issue.fields.assignee;
      

      if (issue.fields.fixVersions.length > 0) {
        fixversionurl = issue.fields.fixVersions[0].self;
      }

      if (issue.fields.issuetype.name != "Epic")
      {

      result.push({
        url: baseUrl,
        projectName: config.projectName,
        project: issue.fields.project,
        issueKey: issue.key,
        status: issue.fields.status,
        assigneeName: assignee ? assignee.displayName : "Unassigned",
        progress: issue.fields.progress,
        priority: issue.fields.priority,
        epic: issue.fields.customfield_10000 ? issue.fields.customfield_10000 : "noepic",
        type: issue.fields.issuetype,
        fixVersions: issue.fields.fixVersions
      });
    } else {
      epics[issue.key] = issue.fields.summary;
    }
    });

    var options2 = {
        timeout: config.timeout || 15000,
        url: fixversionurl,
        headers: {"authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +config.globalAuth[authName].password).toString("base64")}
      };


    dependencies.easyRequest.JSON(options2, function(error, Data) {
        var data = { 
            issuedata: result,
            startDate: Data.startDate,
            releaseDate: Data.releaseDate,
            epics: epics
          };

          cache.put(cache_key, data, cache_expiration);
          cache.put("issues-"+config.projectName, data, 10 * 60 * 1000);
          job_callback(null, data);

    });






  });
}
