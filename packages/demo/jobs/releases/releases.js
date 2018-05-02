// jobs/releases

var querystring = require('querystring'),
    cache = require('memory-cache');


module.exports = function(config, dependencies, job_callback) {

  // fallback to for configuration compatibility
  var authName = config.authName || 'jac';

  if (!config.globalAuth || !config.globalAuth[authName] ||
    !config.globalAuth[authName].username || !config.globalAuth[authName].password){
    return job_callback('no credentials found in release info job. Please check global authentication file (usually config.globalAuth)');
  }


  var logger = dependencies.logger;

	
  /*var params = {
    jql: config.jql,
    maxResults: config.maxResults || 1000,
    fields: "id,description,name,archived,released,releasedate,overdue"
  };*/

  // setup for fetching JSON from jira, use param variable if only some info is needed, see below
  var options = {
    timeout: config.timeout || 15000,
  //url: config.jira_server + '/rest/api/2/project/' + config.current_project + '/versions?' + querystring.stringify(params),
    url: config.jira_server + '/rest/api/2/project/' + config.projectName,
    headers: {
      "authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +
          config.globalAuth[authName].password).toString("base64")
    }
  };

  // cache response
  var cache_expiration = 60 * 1000; //ms
  var cache_key = 'atlassian-jira-releases:config-' + JSON.stringify(config); // unique cache object per job config
  if (cache.get(cache_key)){
      return job_callback (null, cache.get(cache_key));
  }

  //versions json
  //options.url += '/versions';
  dependencies.easyRequest.JSON(options, function(error, Data) {
    if (error)
        return job_callback(error);


    /*if (!Data.versions)
      Data.versions = [];*/

    //options.url += "/versions";

    var result = [];
    Data.versions.forEach(function(version) {
    
      result.push({
      self: version.self,
      url: config.jira_server + '/projects/' + config.projectName + '/versions/' + version.id,
		  id: version.id,
		  name: version.name,
		  description: version.description,
		  archived: version.archived,
		  released: version.released,
		  releasedate: version.releaseDate,
		  overdue: version.overdue
		  
	  }); 
	  
	  
    });

    var basic = {
      projectname: Data.name,
      projecticon: Data.avatarUrls["48x48"],
    };


/*    var data = { 
      releases: result
    };*/

    var data = { 
      basic: basic,
      releases: result
    };


    cache.put(cache_key, data, cache_expiration);

    job_callback(null, data);

  });


}
