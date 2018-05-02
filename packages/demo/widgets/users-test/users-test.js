widget = {
  
  onData: function (el, data) {
      console.log(data);
      var projectmembers = {};
     // get assignee.key

     function getAvatar (user){
      
        return ("<div class='icon'><img class='avatar' src='" + user.assigneeAvatarURL + "'/><div/>");
      
    }

    $('.users', el).empty();

    if (data.users.length){
      var userText = (data.users.length === 1) ? "USER" : "users";

      
    else {
      $('h2', el).html("NO USERS");
    }
    

    if (data.users.length > 0) {

      data.users.forEach(function(user) {
        var listItem = $("<li/>")

        listItem.append(getAvatar(user));


var $userData = $("<div class=\"issue-data\"/>");
        $userData.append($("<strong/>").addClass("issue-key").append("<a target=_blank href='" + user.assigneeAvatarURL + "'>" + user.assigneeKey + "</a>"));
        listItem.append($issueData);


    console.log(user);


        listItem.append($("<div/>").addClass("issue-blocking").append());

        $('.users', el).append(listItem);
      });

  

    } else {
      $('.bugs', el).append(
        "<div class='no-bugs-message'>" +
          "NO BUGS FOUND" +
          "<div class='smiley-face'>" +
          "☺" +
          "</div>" +
        "</div>");
    }

    $('.content', el).show();
  }

  
};