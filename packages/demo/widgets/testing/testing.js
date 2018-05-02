// widgets/general-info

widget = {

	onInit: function(el) {
		try {
			$('.testing', el).empty();

			//canvas for chartjs to generate chart onto
			$('.testing', el).append("<div id='chartdiv'><canvas id='testchart' /></div>");

			//radio buttons for uat charts etc
			$('.testing', el).append('<form action="" class="chartradio"><input type="radio" id="radio1" name="piechart" value="all">All' +
			'<input type="radio" id="radio2" name="piechart" value="uat">UAT<input type="radio" id="radio3" name="piechart" value="integration" checked>Integration</form>');
		
		} catch (e) {
			console.log("Failed to init canvas or radio buttons", e);
		}
			
	},

  onData: function (el, data) {

	function replaceChartData(chart, newData, headerTitle) {
		try {
			chart.data.labels = newData.labels;
			chart.data.datasets = newData.data;
			chart.data.status = newData.status;
			document.getElementById("testing-header").innerHTML = 'Testing info - ' + headerTitle;
			
			chart.update();
			
		} catch (e) {
			console.log(e);
		}
	}

	function changeChart(chart, allData, uatData, integrationData) {

		switch($('input:radio[name="piechart"]:checked').val()) {
			case "all":
				replaceChartData(chart, allData, "All tests");
				break;
			case "uat":
				replaceChartData(chart, uatData, "UAT");
				break;
			case "integration":
				replaceChartData(chart, integrationData, "Integration tests");
				break;

		}

	}

	try {

		if (data.tests.length > 0) {

		console.log(data);
		
		$('input').eq( ( $('input:checked').index() + 1 ) % 3 ).prop('checked', true);
		
		var testNotStarted = [], testPassed = [], testFailed = [];
		var uatNotStarted = [], uatPassed = [], uatFailed = [];
		var integrationNotStarted = [], integrationPassed = [], integrationFailed = [];

		//just shoving json data into arrays for later use
			data.tests.forEach(function(issue) {
				try {
					if(issue.issueStatus.name == "Not Started") {
						testNotStarted.push(issue);
					} if(issue.issueStatus.name == "Passed") {
						testPassed.push(issue);
					} if(issue.issueStatus.name == "Failed") {
						testFailed.push(issue);
					} else {
						throw("No issues found or an issue with an unusual status was found");
					}

				} catch (e) {
					console.log(e);
				}		
			});

			testNotStarted.forEach(function(issue) {
				try {
					if(issue.issueLabels[0] == "UAT") {
						uatNotStarted.push(issue);
					} if(issue.issueLabels[0] == "Integration") {
						integrationNotStarted.push(issue);
					} else {
						throw("Failed to push not started data or none exists");
					}

				} catch (e) {
					console.log(e);
				}
			});

			testPassed.forEach(function(issue) {
				try {
					if(issue.issueLabels[0] == "UAT") {
						uatPassed.push(issue);
					} if(issue.issueLabels[0] == "Integration") {
						integrationPassed.push(issue);
					} else {
						throw("Failed to push passed data or none exists");
					}

				} catch (e) {
					console.log(e);
				}
			});
			
			testFailed.forEach(function(issue) {
				try {
					if(issue.issueLabels[0] == "UAT") {
						uatFailed.push(issue);
					} if(issue.issueLabels[0] == "Integration") {
						integrationFailed.push(issue);
					} else {
						throw("Failed to push failed data or none exists");
					}

				} catch (e) {
					console.log(e);
				}
			});

			var allChartData = {
				labels: ["Passed", "Failed", "Not Started"],
				data: [{
					backgroundColor: ["#14892c", "#ce0000", "#4a6785"],
					data: [testPassed.length, testFailed.length, testNotStarted.length],
					borderWidth: 2
				}],
				status: "allData"
			};


			//TODO: get clarification from how UAT and integration tests are handled in jira 
			var uatChartData = {
				labels: ["Passed", "Failed", "Not Started"],
				data: [{
					backgroundColor: ["#14892c", "#ce0000", "#4a6785"],
					data: [uatPassed.length, uatFailed.length, uatNotStarted.length],
					borderWidth: 2
				}],
				status: "uatData"
			};

			var integrationChartData = {
				labels: ["Passed", "Failed", "Not Started"],
				data: [{
					backgroundColor: ["#14892c", "#ce0000", "#4a6785"],
					data: [integrationPassed.length, integrationFailed.length, integrationNotStarted.length],
					borderWidth: 2
				}],
				status: "integrationData"
			};


			//chartjs init					
			var initChartData = {
				labels: ["No info available"],
				datasets: [{
					backgroundColor: ["#60BD68", "#F15854", "#5DA5DA"],
					data: [1],
					borderWidth: 2
				}],
				status: "initData"
			};
			
			var chartConfig = {
				type: 'pie',
				data: initChartData,
				options: {
					responsive: true,
					animation: false,
					legend: {
						labels: {
							fontColor: 'white',
							fontSize: 18
						}
					}
				}
			};

			document.getElementById("chartdiv").innerHTML = '&nbsp;';
			document.getElementById("chartdiv").innerHTML = "<canvas id='testchart' />";
			var chartCanvas = document.getElementById("testchart");
			var ctx = chartCanvas.getContext("2d");
			
			var testChart = new Chart(ctx,chartConfig);		
			
			changeChart(testChart, allChartData, uatChartData, integrationChartData);

			try {
				$('input:radio[name=piechart]').change(function(){
					changeChart(testChart, allChartData, uatChartData, integrationChartData);
				});
			} catch (e) {
				console.log(e);
			}
			
			//Clicking functions for chart
			chartCanvas.onclick = function(e) {
				var slice = testChart.getElementAtEvent(e);
				if (!slice.length) return; // return if not clicked on slice

				//check what status we're currently on, so we can get proper JQL arguments


				var jqlParams = '?jql=project%20%3D%20' + data.projectName + 
				'%20AND%20type%20%3D%20"Test%20Case"%20AND%20status%20%3D%20';
				var label = slice[0]._model.label;

				switch($('input:radio[name="piechart"]:checked').val()) {
					case "all":
							switch (label) {
								case "Passed":
									window.open(data.issueSearchLink + jqlParams + "Passed");
									break;
								case "Failed":
									window.open(data.issueSearchLink + jqlParams + "Failed");
									break;
							case "Not Started":
									window.open(data.issueSearchLink + jqlParams + '"Not Started"');
									break;
							}
						break;
					case "uat":
							switch (label) {
								case "Passed":
									window.open(data.issueSearchLink + jqlParams + "Passed" + "%20AND%20labels%20" + "%3D%20" + "UAT");
									break;
								case "Failed":
									window.open(data.issueSearchLink + jqlParams + "Failed" + "%20AND%20labels%20" + "%3D%20" + "UAT");
									break;
							case "Not Started":
									window.open(data.issueSearchLink + jqlParams + '"Not Started"' + "%20AND%20labels%20" + "%3D%20" + "UAT");
									break;
							}
						break;
					case "integration":
							switch (label) {
								case "Passed":
									window.open(data.issueSearchLink + jqlParams + "Passed" + "%20AND%20labels%20" + "%3D%20" + "Integration");
									break;
								case "Failed":
									window.open(data.issueSearchLink + jqlParams + "Failed" + "%20AND%20labels%20" + "%3D%20" + "Integration");
									break;
							case "Not Started":
									window.open(data.issueSearchLink + jqlParams + '"Not Started"' + "%20AND%20labels%20" + "%3D%20" + "Integration");
									break;
							}
						break;
				}
				
			 }
			 

			$('.content', el).show();
			
		} else {
			$('.testing', el).append("<p>No project data exists</p>");
		}

	} catch (e) {
		console.log("Testing error", e);
		$('.testing', el).append("Failed to fetch project info");
	}

  }

};
