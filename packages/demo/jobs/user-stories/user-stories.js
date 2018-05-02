var querystring = require('querystring'),
    cache = require('memory-cache');

module.exports = function(config, dependencies, job_callback) {
  var jobname = "userstories";
  config.jql =  'project = '+config.projectName+' AND type = Story';
  var apitest = require("./../../jira-api");
  var logger = dependencies.logger;
  var fields = "key,summary,assignee,priority,status";
  var options = apitest.jiraApiCall(config, dependencies, job_callback, fields, jobname);
  if (options[0] != ""){
    return job_callback(options[0]);
  }
  var options = options[1];
  // cache response
  var cache_expiration = 60 * 1000; //ms
  var cache_key = 'atlassian-jira-blockers:config-' + JSON.stringify(config); // unique cache object per job config
  if (cache.get(cache_key)){
      return job_callback (null, cache.get(cache_key));
  }

  dependencies.easyRequest.JSON(options, function(error, Data) {
    if (error)
        return job_callback(error);

    var result = [];

    if (!Data.issues)
    Data.issues = [];

    Data.issues.forEach(function(issue) {
      var baseUrl = issue.self.substring(0, issue.self.indexOf("/rest/api"));
      var assignee = issue.fields.assignee;

      result.push({
        url: baseUrl + "/browse/" + issue.key,
        baseUrl: baseUrl,
        projectName: config.projectName,
        issueKey: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status,
        assignee: assignee,
        assigneeName: assignee ? assignee.displayName : "Unassigned",
        assigneeAvatarURL: assignee ? assignee.avatarUrls["48x48"] : "http://student.labranet.jamk.fi/~K2470/unassigned.png",
      });
    });


    var data = { 
      stories: result,
      scrolling: config.scrolling
    };

    cache.put(cache_key, data, cache_expiration);

    job_callback(null, data);

  });
}
