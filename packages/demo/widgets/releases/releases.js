// widgets/releases-info

widget = {

  onData: function (el, data) {
	console.log(data);

	if (data.releases.length > 0) {
		$('.releases', el).empty();
		$('.releases', el).append("<div class='overdue'><h4>Overdue</h4></div>");
		$('.releases', el).append("<div class='duesoon'><h4>Due soon</h4></div>");
		$('.releases', el).append("<div class='released'><h4>Released</h4></div>");

		if (data.releases.length > 0) {
			data.releases.forEach(function(version) {
				console.log(version);

				try {
					// TODO: modify overdue, duesoon etc. headers to arrays and check for empty
					var listItem = $("<li/>");
					var $issueData = $("<div class=\"issue-data\"/>");
			
					$issueData.append($("<strong/>").addClass("issue-key").append("<a target=_blank href='" + version.url + "'>" + version.name + "</a> - "));
					$issueData.append($("<span/>").addClass("status-").append("Release date: <span style='color:lightgrey'>" + version.releasedate + "</span><br> "));
					if(version.description != undefined) {
						$issueData.append($("<span/>").addClass("status-" + version.description.replace(/\s+/g, '').toLowerCase()).append(version.description+" "));
					}
					listItem.append($issueData);

					if(version.released != true && version.overdue) {
						$('.overdue', el).append(listItem);	 
						return;
					} if (version.released != true && version.overdue != true) {
						$('.duesoon', el).append(listItem);	 
						return;
					} else {
						$('.released', el).append(listItem);	 
						return;
					}
				} catch (e) {
					console.log(e);
				}

			});

		}

	} else {
		$('.releases', el).append("<h4>Release data not found or none exists</h4>");
	} 

    $('.content', el).show();

  }

};
