// widgets/general-info

widget = {

  onData: function (el, data) {
//	console.log("General-info", data);

		try {
		//	console.log(data.general);
			$('.generalinfo', el).empty();
			var projectNamediv = $("<div class='projectname' />");
			projectNamediv.append("<div class='projectname-text'><img class='projectname-img' src='" + data.general.projecticon + 
			"' /><a href='" + data.general.projecturl + "' target='_blank'>" + data.general.projectname + "</a></div>");
			$('.generalinfo', el).append(projectNamediv);
			projectNamediv.append("<div class='release-date'> Upcoming release date: </div>");
			
			
			if (data.releases.length > 0) {

				data.releases.forEach(function(version) {
			//		console.log(version);

					try {
						if(version.released != true) {
														
							var $issueData = $("<span/>");
							if(version.overdue) {
								$issueData.addClass("release-overdue").append("<a target='_blank' href='" + version.url + "'>" + version.name + "</a>");
							} else {
								$issueData.addClass("release-duesoon").append("<a target='_blank' href='" + version.url + "'>" + version.name + "</a>");
							}
							$('.release-date', el).append($issueData);
						}
					} catch (e) {
						console.log(e);	
					}		
				});
				
			} else {
				$('.generalinfo', el).append("<p>Failed to fetch release data or none exists</p>");
			}

		} catch (e) {
			console.log(e);
			$('.generalinfo', el).append("Failed to fetch project info or none exists");
		}

    $('.content', el).show();

  }

};
