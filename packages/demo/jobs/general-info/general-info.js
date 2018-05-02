// jobs/general-info

var querystring = require('querystring'),
    cache = require('memory-cache');


module.exports = function(config, dependencies, job_callback) {

  // fallback to for configuration compatibility
  var authName = config.authName || 'jac';

  if (!config.globalAuth || !config.globalAuth[authName] ||
    !config.globalAuth[authName].username || !config.globalAuth[authName].password){
    return job_callback('no credentials found in general info job. Please check global authentication file (usually config.globalAuth)');
  }

  var logger = dependencies.logger;
	
  // setup for fetching JSON from jira
  var options = {
    timeout: config.timeout || 15000,
    url: config.jira_server + '/rest/api/2/project/' + config.projectName,
    headers: {
      "authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +
          config.globalAuth[authName].password).toString("base64")
    }
  };

  // cache response
  var cache_expiration = 60 * 1000; //ms
  var cache_key = 'atlassian-jira-general:config-' + JSON.stringify(config); // unique cache object per job config
  if (cache.get(cache_key)){
      return job_callback (null, cache.get(cache_key));
  }

  //versions json
  dependencies.easyRequest.JSON(options, function(error, Data) {
    if (error)
        return job_callback(error);
        
    var result = [];

    var basic = {
      projectname: Data.name,
      projecticon: Data.avatarUrls["48x48"],
      projecturl: config.jira_server + '/projects/' + config.projectName + '/summary'
    };

      Data.versions.forEach(function(version) {
    
      result.push({
      self: version.self,
      url: config.jira_server + '/projects/' + config.projectName + '/versions/' + version.id,
      projectname: Data.name,
      projecticon: Data.avatarUrls["16x16"],
		  id: version.id,
		  name: version.name,
		  description: version.description,
		  archived: version.archived,
		  released: version.released,
		  releasedate: version.releaseDate,
		  overdue: version.overdue
		  
	  }); 
	  
	  
    });  


    var data = { 
      general: basic,
      releases: result
    };


    cache.put(cache_key, data, cache_expiration);

    job_callback(null, data);

  });


}
