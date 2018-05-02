widget = {
  //runs when we receive data from the job
  onData: function (el, data) {
    console.log(data);
    epics = {};
    baseurl = "http://absolutemonster.website:8080/";
    var release_status = "pass";
    var all_projects = {};
    all_projects["fail"] = [];
    all_projects["pass"] = [];

    function statusBall(status) {
      if (status == "fail") {
        release_status = "fail";
      }
      return '<span class="' + status + '"><i class="fas fa-circle"></i></span>&nbsp;';

    }


    $(".content", el).empty();
    var rdate = data.projects[Object.keys(data.projects)[0]].releaseDate.split("-");
    rdate_str = rdate[2] + "." + rdate[1] + "." + rdate[0];


    for (var projectkey in data.projects) {
      var testcases = {};
      var epics = {};
      var projectdiv = $("<div class='project'/>");
      var project = data.projects[projectkey];

      for (var issuekey in project.issuedata) {
        var issue = project.issuedata[issuekey];
        if (issue.type.name == "Test Case") {
          testcases[issue.status.name] = testcases[issue.status.name] ? testcases[issue.status.name] + 1 : 1;
          //console.log(issue);
        } else {
          epics[issue.epic] = epics[issue.epic] ? epics[issue.epic] : {};
          epics[issue.epic][issue.status.statusCategory.name] = epics[issue.epic][issue.status.statusCategory.name] ? epics[issue.epic][issue.status.statusCategory.name] + 1 : 1;
        }

      }
      
      var host = window.location.host;
      var flexcont = $("<div class='flex-cont'/>");
      var projectstatus = true;
      var testurlpass = baseurl+'issues/?jql=type = "Test Case" AND status = "Passed" AND Project = '+projectkey;
      var testurlfail = baseurl+'issues/?jql=type = "Test Case" AND status = "Failed" AND Project = '+projectkey;
      
      flexcont.append("<div class='flex-item test'>Test <a href='"+testurlpass+"'><span class='pass'>" + testcases["Passed"] + "</span></a> / <a href='"+testurlfail+"'><span class='fail'>" + testcases["Failed"] + "</span></a></div>");
      for (var epickey in project.epics) {
        var todo = epics[epickey]["To Do"] ? epics[epickey]["To Do"] : 0;
        var inpro = epics[epickey]["In Progress"] ? epics[epickey]["In Progress"] : 0;
        var done = epics[epickey]["Done"] ? epics[epickey]["Done"] : 0;
        if (todo == 0 && inpro == 0) {
          var epicbackground = "epicname";
        } else {
          var epicbackground = "epicname-bad";
          projectstatus = false;
        }

        //var debug = " ";//+todo+"/"+inpro+"/"+done;
        //very smart green/red background color
        var flexitem = $("<div />").append("<a href='"+baseurl+"issues/?jql=project="+projectkey+' AND "Epic Link" ='+epickey+"'>" +project.epics[epickey]+"</a>").addClass(epicbackground + " flex-item");
        flexcont.prepend(flexitem);
      }
      var projectcategory = projectstatus ? "pass" : "fail";

      project_ball = statusBall(projectcategory);

      projectdiv.append(project_ball + " <a class='projectname' href='/qub1t_dashboard_" + project.issuedata[0].project.key + "'>" + project.issuedata[0].project.key + ": " + project.issuedata[0].project.name + "</a>" + "<br>");

      projectdiv.append(flexcont);

      //console.log(epics);


      all_projects[projectcategory].push(projectdiv);

    }

    //show ydrs
    for (var ydrkey in data.YDR) {
      var projectdiv = $("<div class='project'/>");
      var ydr = data.YDR[ydrkey].issue;
      var url = data.YDR[ydrkey].url;
      var projectcategory = (ydr.fields.status.statusCategory.name == "Done") ? "pass" : "fail";
      var ydr_ball = statusBall(projectcategory);

      projectdiv.append(ydr_ball + " <a class='projectname' href='" + url + "'>" + ydr.key + ": " + ydr.fields.summary + "</a><br>");
      //console.log(ydr);
      all_projects[projectcategory].push(projectdiv);

    }

    //console.log("lol", all_projects);
    for (var i = 0; i < all_projects["fail"].length; i++) {
      $(".content", el).append(all_projects["fail"][i]);
      $(".content", el).append($("<hr class='viiva'>"));
    }
    //$(".content", el).append("<br>");
    for (var i = 0; i < all_projects["pass"].length; i++) {
      $(".content", el).append(all_projects["pass"][i]);
      $(".content", el).append($("<hr class='viiva'>"));
    }
    $(".content", el).prepend($("<h1 class='release-date'>" + statusBall(release_status) + " Release " + rdate_str + "</h1><br>"));

  }
};