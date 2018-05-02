/**
+
+  JIRA blockers
+
+  Example config:
+
+    "confluence-blockers" : {
+      "timeout": 30000,
+      "retryOnErrorTimes" : 3,
+      "interval" : 120000,
+      "jira_server" : "https://jira.atlassian.com",
+      "useComponentAsTeam" : true,
+      "projectTeams": {
+        "CONFDEV": "Teamless Issue",
+        "CONFVN": "Vietnam"
+      },
+      "highLightTeams" : ["Editor"]    
+      "jql" : "(project in (\"CONFDEV\",\"CONFVN\") AND resolution = EMPTY AND priority = Blocker) OR (project = \"CONF\" AND resolution = EMPTY AND priority = Blocker AND labels in (\"ondemand\"))"
+    },
+
+*/

var querystring = require('querystring'),
    cache = require('memory-cache');



module.exports = function(config, dependencies, job_callback) {
  // fallback to for configuration compatibility
  var authName = config.authName || 'jac';

  config.jql =  'project = '+config.projectName+' AND type = Bug AND resolution = Unresolved ORDER BY priority DESC';

  if (!config.globalAuth || !config.globalAuth[authName] ||
    !config.globalAuth[authName].username || !config.globalAuth[authName].password){
    return job_callback('no credentials found in bugs job. Please check global authentication file (usually config.globalAuth)');
  }

  if (!config.jql || !config.jira_server){
    return job_callback('missing parameters in bugs job');
  }

  var logger = dependencies.logger;

	// 
  var params = {
    jql: config.jql,
    maxResults: config.maxResults || 200,
    fields: "key,summary,assignee,components,labels,priority,status"
  };

  var options = {
    timeout: config.timeout || 15000,
    url: config.jira_server + '/rest/api/2/search?' + querystring.stringify(params),
    headers: {
      "authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +
          config.globalAuth[authName].password).toString("base64")
    }
  };

  // create link to display on the widget
  var linkParams = { jql: config.jql };
  var bugsLink = config.jira_server + "/issues/?" + querystring.stringify(linkParams);

  // cache response
  var cache_expiration = 60 * 1000; //ms
  var cache_key = 'atlassian-jira-blockers:config-' + JSON.stringify(config); // unique cache object per job config
  if (cache.get(cache_key)){
      return job_callback (null, cache.get(cache_key));
  }

  dependencies.easyRequest.JSON(options, function(error, bugData) {
    if (error)
        return job_callback(error);

    var result = [];

    if (!bugData.issues)
      bugData.issues = [];

    bugData.issues.forEach(function(issue) {
      var baseUrl = issue.self.substring(0, issue.self.indexOf("/rest/api"));
      var assignee = issue.fields.assignee;

	// 
      result.push({
        url: baseUrl + "/browse/" + issue.key,
        issueKey: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status,
        projectName: config.projectName,
        unassigned : !issue.fields.assignee,
        assigneeName: assignee ? assignee.displayName : "Unassigned",
        assigneeKey: assignee ? assignee.key : "null",
        assigneeEmail: assignee ? assignee.emailAddress : "",
        assigneeUrl: assignee ? baseUrl + "/secure/ViewProfile.jspa?name=" + assignee.name : "",
        assigneeAvatarURL: assignee ? assignee.avatarUrls["48x48"] : "http://student.labranet.jamk.fi/~K2470/unassigned.png",
       priority: issue.fields.priority,
       
        down: false
      });
    });

    var data = { 
      bugs: result, 
      bugsLink: bugsLink,
      scrolling: config.scrolling,
	  title: config.title
    };

    cache.put(cache_key, data, cache_expiration);

    job_callback(null, data);

  });
}
