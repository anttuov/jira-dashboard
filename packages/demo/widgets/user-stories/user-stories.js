widget = {

  onData: function (el, data) {
//	console.log("USER STORY", data);

  //automatic scrolling functions
function scrollTop() {
   console.log("ylös kututtu", storyscroll);
     // console.log($("#bugs"));
     if(storyscroll)
     {
      $("#stories").animate({
        scrollTop: 0 }, 6000, 'swing', function(){ window.setTimeout( function () { scrollAuto(); }, 5000 ); });
        
     }
      else{
          window.setTimeout( function () { scrollAuto(); }, 5000 );
    }
     

};
function scrollAuto() {
if(storyscroll)
{
  var scrollHeight = document.getElementById('stories').scrollHeight - document.getElementById('stories').clientHeight;

  $("#stories").animate({
    scrollTop: scrollHeight }, 6000, 'swing', function(){ window.setTimeout( function () { 
      scrollTop(); 
    }, 3000 ); });
}
else{
    window.setTimeout( function () { scrollTop(); }, 3000 );
}


console.log("autoscrollaus päällä", storyscroll);
};


	// assignee icon
    function getAvatar (story){

        
        if (story.assignee == null){
          userkey = "null";
        } else {
          userkey = story.assignee.key;
        }
        url = story.url + "?jql=project="+story.projectName+" AND resolution = Unresolved AND type = Story AND assignee="+userkey+" ORDER BY priority DESC"; 
        return ("<a title='"+story.assigneeName+"' href='"+url+"'> <img class='avatar' src='" + story.assigneeAvatarURL + "'/></a>");
      
    }
    
    if (data.stories.length > 0) {
      $('.headers',el).empty();
      $('.stories', el).empty();
      $('.headers').off('click');
      var story_status_count = {"done": 0, "inprogress": 0, "todo": 0}; //0: Done, 1: In Progress, 2: To do
      data.stories.forEach(function(story) {
        var listItem = $("<li />");
        var statusname =  story.status.statusCategory.name.replace(/\s+/g, '').toLowerCase();
        story_status_count[statusname]++;
        listItem.append($("<div />").addClass("issue-key").append($("<div/>").addClass("issue-text").append("<a target=_blank href='" + story.url + "'>" + story.issueKey + "</a> ")));
        listItem.append($("<div />").addClass("status-circle status-" + statusname).append('<span ><i class="fas fa-circle"></i></span>'));
        listItem.append($("<div title='"+ story.status.name +"'/>").addClass("summary").append("<a target=_blank style='color: white;' href='" + story.url + "'>"+story.summary+"</a>"));
        listItem.append(getAvatar(story));
        $('.stories', el).append(listItem);


        //var $summary = $("<div/>").addClass("issue-summary").append(story.summary).appendTo(listItem);
        //listItem.append($("<div/>").addClass("issue-blocking").append());

      
      });
      var headertext = "<div class=\"header-left\">Key&emsp;&emsp;Status</div><div class=\"header-right\">Assignee</div><div class=\"header-center\">Summary</div><div style=\"clear: both;\"/>";
      
      $('.headers', el).prepend(headertext);
      $('.headers',el).append("<p class=scroll-label>Scroll:</p>");
      $('.headers',el).append("<button class=auto>Auto</button>");
      $('.headers',el).append("<button class=manual>Manual</button>");
      
      var title_el = $("<h2/>").append("User Stories: ");
      for (var statuscode in story_status_count) {
          title_el.append($("<span/>").addClass("status-"+statuscode).append(story_status_count[statuscode]));
          if (statuscode != "todo"){
            title_el.append(" / ");
          }
      }
      //var titletext = "User Stories " + story_status_count["done"].toString() +"/"+ story_status_count["inprogress"].toString() +"/"+ story_status_count["todo"].toString();
      $('.headers', el).prepend(title_el);
      $('.stories', el).append("<div class='bottom-row'></div>");
    } 
    console.log("Scrollaus", data.scrolling);
    //$('.content', el).show();

    /*
    if (data.scrolling) {   
      window.onload =  window.setTimeout( function () {scrollBottom(); }, 5000 );    
    }
    */

   $('.headers').on('click', '.auto', function (event) {
    // console.log("painettu");
     storyscroll = true;
     manualscroll = false;
  
     elem = document.getElementById("stories");
     elem.classList.remove('manualscroll');
   });
   
   $('.headers').on('click', '.manual', function (event) {
     //console.log("painettu");
     storyscroll = false;
     manualscroll = true;
  
     elem = document.getElementById("stories");
     elem.classList.add('manualscroll');
     
     $("#stories").finish();

   });

   if (storyInterval == true) {
    if (data.scrolling)
    {      
      window.onload =  window.setTimeout( function () {scrollAuto(); }, 5000 );    
    }
  storyInterval = false;
}
  }
};
