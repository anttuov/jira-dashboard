var querystring = require('querystring'),
    cache = require('memory-cache');

module.exports = function(config, dependencies, job_callback) {
  config.jql = 'project = '+config.projectName;
  // fallback to for configuration compatibility
  var authName = config.authName || 'jac';

  if (!config.globalAuth || !config.globalAuth[authName] ||
    !config.globalAuth[authName].username || !config.globalAuth[authName].password){
    return job_callback('no credentials found in find users job. Please check global authentication file (usually config.globalAuth)');
  }

  if (!config.jql || !config.jira_server){
    return job_callback('missing parameters in find users job');
  }
  //log queried data to server
  var logger = dependencies.logger;

	//parameters for options
  var params = {
    jql: config.jql,
    maxResults: config.maxResults || 1000,
    fields: "assignee"
  };

  
  //role options
  var options = {
    timeout: config.timeout || 20000,
    url: config.jira_server + '/rest/api/2/project/' + config.projectName + '/role',
    headers: {
      "authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +
          config.globalAuth[authName].password).toString("base64")
  }
  };

  function getRoleOptions(roleUrl) {
    var roleOptions = {
      timeout: config.timeout || 20000,
      url: roleUrl,
      headers: {
        "authorization": "Basic " + new Buffer(config.globalAuth[authName].username + ":" +
            config.globalAuth[authName].password).toString("base64")
    }
    };
    return roleOptions;
  }
  
  // create link to display on the widget
  var linkParams = { jql: config.jql };
  var blockersLink = config.jira_server + "/issues/?" + querystring.stringify(linkParams);

  // cache response
  var cache_expiration = 60 * 1000; //ms
  var cache_key = 'atlassian-jira-blockers:config-' + JSON.stringify(config); // unique cache object per job config
  if (cache.get(cache_key)){
      return job_callback (null, cache.get(cache_key));
  }

  var data1 = null;

  dependencies.easyRequest.JSON(options, function(error, roleData){
    if (error)
      return job_callback(error);
    
      var result = [];

    if (!roleData)
        roleData = [];

        for (i in roleData) {
      
          dependencies.easyRequest.JSON(getRoleOptions(roleData[i]), function(error, exRoleData){
            if (!roleData)
              roleData = [];  
              
            result.push({
              //  url: baseUrl,
              //  roleName: i,
              //  roleUri:  roleData[i]
              roleName: exRoleData.name,
              roleActors: exRoleData.actors,
              roleId: exRoleData.actors.name,
              server: config.jira_server   
            }); 
          });
      
          
        }
      
     data1 = { 
      roles: result
    };
  
    cache.put(cache_key, data1, cache_expiration);
 //   getPeopleByRole();
    sendData();
  });
   
  function searchRoles(url){
    var users = [];
  };

  
  function sendData(){
    if(data1 != null){
      setTimeout(endfunc, 5000);
    function endfunc(){
      job_callback(null, data1)
  }
    }
  }
}