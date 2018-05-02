widget = {

  onData: function (el, data) {
//	console.log(["Health", data]);
    

    if (data.issuedata.length > 0) {
      $('.health', el).empty();
      $('.title', el).empty();
      var progress_done = 0;
      var progress_total = 0;
      var total_issues = 0;
      var status_count = {"done": 0, "inprogress": 0, "todo": 0};
      var status_category_names = {"done": "Done", "inprogress": "In Progress", "todo": "To Do"};
      var blockers = 0;
      data.issuedata.forEach(function(issue) {
        var statusname =  issue.status.statusCategory.name.replace(/\s+/g, '').toLowerCase();
        status_count[statusname]++;
        total_issues++;
        progress_done += issue.progress.progress;
        progress_total += issue.progress.total;
        if(issue.status.statusCategory.name != "Done" && issue.priority.name == "Blocker")
        {
          blockers++;
        }
        
      });
    //  console.log(blockers);
      var healthbar_container = $('<div/>').addClass("healthbarcont");
      for (var status in status_count) {
          var divwidth = parseInt(100*status_count[status]/total_issues);
          var statusurl = data.issuedata[0].url + '/issues/?jql=project = '+data.issuedata[0].projectName+' AND statusCategory = "'+ status_category_names[status]+'"';
          healthbar_container.append($('<div/>').addClass("healthbar status-"+status).append("<a href='"+statusurl+"'>"+status_count[status]+"</a>").css("width", divwidth+"%"));
        //  console.log(status);
      }
      $('.health', el).append(healthbar_container);

    //  console.log("health", status_count, progress_done, progress_total);
      var done_percent = 100.0*progress_done/progress_total
      var daysleft = Math.floor(( Date.parse(data.releaseDate) - Date.now()) / (24*60*60*1000));
      var d1 = Date.parse(data.releaseDate) - Date.parse(data.startDate);
      var d2 = Date.now() - Date.parse(data.startDate);
      var timeleft_percent = Math.round((d2*100.0) / d1);
      var done_time_diff = done_percent-timeleft_percent;

      $('.title', el).append("Project Health&emsp;" + daysleft +" days left")
      var listElement = $('<ul/>');
      var data_text = $('<span/>').addClass("data-text").append(Math.round(100.0*progress_done/progress_total)+"%");
      listElement.append($('<li/>').append(data_text).append(" Work complete"));
      var data_text = $('<span/>').addClass("data-text").append(timeleft_percent+"%");
      listElement.append($('<li/>').append(data_text).append( " Time elapsed"));
      var data_text = $('<span/>').addClass("data-text").append(blockers);
      listElement.append($('<li/>').append(data_text).append((blockers === 1) ? " Blocker" : " Blockers"));
      $('.health', el).append(listElement);
    //  console.log(timeleft_percent, done_percent);

      $('.health', el).append($('<p/>').append(Math.round(100.0*progress_done/progress_total) + "% Work complete"));
      //$('.health', el).append($('<p/>').append("Release date: "+data.releaseDate+" Time left: " + daysleft + " days"));
      $('.health', el).append($('<p/>').append( timeleft_percent +"% Time elapsed"));
      //$('.health', el).append($('<p/>').append("Work done, time left difference: " + done_time_diff + " %"));
      $('#dummy-widget').empty();
      if(done_time_diff < -5){
        $('#dummy-widget').append('<i class="far fa-frown"></i>');
      }
      else if(done_time_diff >= -5 && done_time_diff < 1){
        $('#dummy-widget').append('<i class="far fa-meh"></i>');
      }
      else if(done_time_diff >= 1){
        $('#dummy-widget').append('<i class="far fa-smile"></i>');
      }


      $('.health', el).show();
    } 

    
  }

};
