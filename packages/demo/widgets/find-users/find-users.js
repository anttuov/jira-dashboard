widget = {

  onData: function (el, data) {
      var projectmembers = {};
   // console.log("find-users", data);
    if(data.roles != 0){
    try{
      //sort data.roles alphabetically 
      data.roles.sort(function(a,b){
      var textA = a.roleName.toUpperCase();
      var textB = b.roleName.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1:0;
    });    
   // console.log("sorted find-users", data);
      $('.members', el).empty();
      //get profile names and avatars from data and put each unique one into projectmembers dictionary.     
    data.roles.forEach(function(users){  
      if(users.roleName != "Administrators"){
      var server = users.server;
      var rolename = users.roleName;
      $('<ul class=' + rolename + '>' + rolename + ': </ul>').appendTo('.members'); //create divs for each role   
    //go through users in each role and make a dictionary
    users.roleActors.forEach(function(actor){
      if(actor.displayName != "jira-administrators"){
        var actorname = actor.displayName;
        var avatar = actor.avatarUrl;                  
        var id = actor.name;
        projectmembers[actorname] = [avatar, id]; //make into a dictionary    
        }
      });   
    }
      //go through dictionary, create list with avatars for each role div
      for (var user in projectmembers){
        $('.' + rolename).append( "<li class=\"images\">" + 
        "<a target='_blank' href='" + server + "/secure/ViewProfile.jspa?name=" + projectmembers[user][1] + "'>" +
        "<img class='avatar' src='" + projectmembers[user][0].replace("xsmall", "xlarge") + 
        "' title='"+ user +"' alt='"+ user +"'/></a></li>")
        } 
        projectmembers ={};
      });      
    }
    catch(e){
      console.log(e);
    }
  }
  // show html here.
  $('.content',el).show(); 
  }
};
