var querystring = require('querystring');

module.exports = {
    jiraApiCall: function(config, dependencies, job_callback, fields, jobname)  {
  // fallback to for configuration compatibility
  var authName = config.authName || 'jac';
  var error = "";
  if (!config.globalAuth || !config.globalAuth[authName] ||
    !config.globalAuth[authName].username || !config.globalAuth[authName].password){
    error = 'no credentials found in user stories job. Please check global authentication file (usually config.globalAuth)';
  }

  if (!config.jql || !config.jira_server){
    error = 'missing parameters in user stories job';
  }

  var logger = dependencies.logger;

	// 
  var params = {
    jql: config.jql,
    maxResults: config.maxResults || 15,
    fields: fields
  };

  var options = {
    timeout: config.timeout || 15000,
    url: config.jira_server + '/rest/api/2/search?' + querystring.stringify(params),
    headers: {
      "authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +
          config.globalAuth[authName].password).toString("base64")
    }
  };
  return [error, options];

}
}