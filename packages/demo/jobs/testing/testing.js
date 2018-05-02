// jobs/testing

var querystring = require('querystring'),
    cache = require('memory-cache');

module.exports = function(config, dependencies, job_callback) {

  // fallback to for configuration compatibility
  var authName = config.authName || 'jac';
  config.jql = 'project = ' + config.projectName + ' ORDER BY priority DESC';

  if (!config.globalAuth || !config.globalAuth[authName] ||
    !config.globalAuth[authName].username || !config.globalAuth[authName].password){
    return job_callback('no credentials found in general info job. Please check global authentication file (usually config.globalAuth)');
  }

  var logger = dependencies.logger;
	
  var params = {
    jql: config.jql,
    maxResults: config.maxResults || 1000,
  //  fields: "key,summary,assignee,components,labels,priority"
  };

  // setup for fetching JSON from jira, use param variable if only some info is needed, see below
  var options = {
    timeout: config.timeout || 15000,
      url: config.jira_server + '/rest/api/2/search?' + querystring.stringify(params),
    headers: {
      "authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +
          config.globalAuth[authName].password).toString("base64")
    }
  };

  var linkParams = { jql: config.jql };
  var testsLink = config.jira_server + "/issues/?" + querystring.stringify(linkParams);

  // cache response
  var cache_expiration = 60 * 1000; //ms
  var cache_key = 'atlassian-jira-general:config-' + JSON.stringify(config); // unique cache object per job config
  if (cache.get(cache_key)){
      return job_callback (null, cache.get(cache_key));
  }

  dependencies.easyRequest.JSON(options, function(error, Data) {
    if (error)
        return job_callback(error);
        
    var result = [];

    if (!Data.issues) {
      Data.issue = [];
    }

    Data.issues.forEach(function(issue) {
    
      var baseUrl = issue.self.substring(0, issue.self.indexOf("/rest/api"));
      var subtask = issue.fields.subtasks;

      if (issue.fields.issuetype.name == "Test Case") {
        result.push({
          url: baseUrl + "/browse/" + issue.key,
          issueKey: issue.key,
          issueType: issue.fields.issuetype,
          issueStatus: issue.fields.status,
          issueLabels: issue.fields.labels
        }); 
      } 
	  
    });  


    var data = { 
      tests: result,
      testsLink: testsLink,
      issueSearchLink: config.jira_server + "/issues/",
      projectName: config.projectName
    };


    cache.put(cache_key, data, cache_expiration);

    job_callback(null, data);

  });


}
