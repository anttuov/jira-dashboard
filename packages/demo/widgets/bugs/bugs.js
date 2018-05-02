widget = {
  onData: function (el, data) {

    var manualscroll = false;

    function scrollTop() { // scrolls back to top, called after autoscroll reaches the bottom of the div
      if (bugscroll) {
        $("#bugs").animate({
          scrollTop: 0
        }, 6000, 'swing', function () { window.setTimeout(function () { scrollAuto(); }, 5000); });
      }
      else {
        window.setTimeout(function () { scrollAuto(); }, 5000);
      }
    };
    function scrollAuto() { // scrolls to bottom and calls scrollTop
      if (bugscroll) {
        var scrollHeight = document.getElementById('bugs').scrollHeight - document.getElementById('bugs').clientHeight;

        $("#bugs").animate({
          scrollTop: scrollHeight
        }, 6000, 'swing', function () {
          window.setTimeout(function () {
            scrollTop();
          }, 3000);
        });
      }
      else {
        window.setTimeout(function () { scrollTop(); }, 3000);
      }
    };
    // bug priority icon
    function getAvatar(bug) {
      return ("<div class='icon'><img class='avatar' src='" + bug.priority.iconUrl + "'/><div/>");
    }
    $('.headers', el).empty();
    $('.bugs', el).empty();
    $('.mainheaders', el).empty();
    $('.mainheaders').off('click');

    // scroll button click handlers
    $('.mainheaders').on('click', '.auto', function (event) {
      bugscroll = true;
      manualscroll = false;
      elem = document.getElementById("bugs");
      elem.classList.remove('manualscroll');
    });
    $('.mainheaders').on('click', '.manual', function (event) {
      bugscroll = false;
      manualscroll = true;
      elem = document.getElementById("bugs");
      elem.classList.add('manualscroll');
      $("#bugs").finish();
    });

    //total bug count
    if (data.bugs.length) {
      var bugText = (data.bugs.length === 1) ? "BUG" : "BUGS";
      bugText = data.title;
      var severity = (data.bugs.length > 10) ? "veryhigh" : ((data.bugs.length > 15) ? "high" : "normal");
      $('.mainheaders').append("<h2>Bugs</h2>");
      $('h2', el).html("<a href='" + data.bugsLink + "'><span class=" + severity + ">" + data.bugs.length + "</span> " + bugText + "</a>");
    }
    else {
      $('h2', el).html("NO BUGS");
    }
    // generate scroll buttons
    $('.mainheaders', el).append("<p class=scroll-label>Scroll:</p>");
    $('.mainheaders', el).append("<button class=auto>Auto</button>");
    $('.mainheaders', el).append("<button class=manual>Manual</button>");

    if (data.bugs.length > 0) {
      var headertext = "<div class=\"header-left\">Prio. Issue Key</div><div class=\"header-right\">Assignee</div><div class=\"header-center\">Summary</div><div style=\"clear: both;\"/>";

      $('.headers', el).prepend(headertext);

      data.bugs.forEach(function (bug) {
        var listItem = $("<li/>")

        listItem.append(getAvatar(bug));

        //issue title link to issue page
        var $issueData = $("<div title='" + bug.status.name + "' class=\"issue-data\" />");
        $issueData.append($("<strong/>").addClass("issue-key").append("<a target=_blank href='" + bug.url + "'>" + bug.issueKey + "</a>"));
        listItem.append($issueData);

        //bug summary
        var $summary = $("<div title='" + bug.status.name + "'/>").addClass("issue-summary").append("<a target=_blank style='color: white;' href='" + bug.url + "'>" + bug.summary + "</a>");
        listItem.append($summary);

        var userbugsurl = bug.url + "?jql=project=" + bug.projectName + " AND resolution = Unresolved AND type = Bug AND assignee=" + bug.assigneeKey + " ORDER BY priority DESC";
        //assignee name link to user page
        var $assignee = $("<div/>").addClass("assignee").append("<a title='" + bug.assigneeName + "'target=_blank href='" + userbugsurl + "'><img class='avatar' src='" + bug.assigneeAvatarURL + "'></a>");
        listItem.append($assignee);


        $('.bugs', el).append(listItem);
      });
      //empty div for padding
      $('.bugs', el).append("<div class='bottom-row'></div>");

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

    if (bugsInterval == true) { // start scrolling interval when page is loaded
      if (data.scrolling) {
        window.onload = window.setTimeout(function () { scrollAuto(); }, 5000);
      }
      bugsInterval = false;
    }
  }
};
