widget = {

	onData: function (el, data) {

		// closes dropdown menu if clicked somewhere else
		window.onclick = function (event) {
			if (!event.target.matches('.menubtn')) {
				var dropdowns = document.getElementsByClassName("dropdown-content");
				var i;
				for (i = 0; i < dropdowns.length; i++) {
					var openDropdown = dropdowns[i];
					if (openDropdown.classList.contains('showmenu')) {
						openDropdown.classList.remove('showmenu');
					}
				}
			}
		};

		// show/hide graph by epic
		function changeGraph(epics, alternatingCounter, interv, clicked) {
			console.log("alternating?", alternating);
			// if function called by interval, show graph that matches alternatingCounter, and hide all the other graphs
			if ((interv && alternating)) {
				epics.forEach(function (epic) {
					if ($("#burndown" + epic).css('opacity') == '1' && epics.indexOf(epic) != alternatingCounter) {
						$("#burndown" + epic).animate({ opacity: 0 }, 1600);
					}
				});
				if ($("#burndown" + epics[alternatingCounter]).css('opacity') == '0') {
					$("#burndown" + epics[alternatingCounter]).animate({ opacity: 1 }, 1600);
				}
				$('h2', el).text(data.title + " - " + epicSummaries[alternatingCounter]);
			}
			// if function called by click of epic button, hide all graphs and show the graph matching clicked button
			else if (clicked) {
				epics.forEach(function (epic) {
					$("#burndown" + epic).finish().animate({ opacity: 0 }, 600);
				});
				$("#burndown" + epics[alternatingCounter]).finish().animate({ opacity: 1 }, 600);
				$('h2', el).text(data.title + " - " + epicSummaries[alternatingCounter]);
			}
		};

		if (data.dev.progress.length > 0) {
			$('.right', el).empty();

			var alternatingCounter = 0; // index of epic currently shown
			var epics = []; // epic keys
			var epicSummaries = [];

			var projectLength = Date.parse(data.dev.projectLength[0].releaseDate) - Date.parse(data.dev.projectLength[0].startDate); // project length in seconds
			var days = Math.floor(projectLength / 86400000); // project length in days
			var startDate = new Date(data.dev.projectLength[0].startDate);
			var endDate = new Date(data.dev.projectLength[0].releaseDate);

			if (days) {
				var daysTable = [];  // used as chart x-axis
				for (var i = 0; i < days; i++) {
					daysTable[i] = i + 1;
				}
			}

			// get all epics from issues
			data.dev.progress.forEach(function (issue) {
				if (issue.epic) {
					epics.indexOf(issue.epic) === -1 ? epics.push(issue.epic) : console.log("epic already found");
				}
			});
			epics.sort();

			// if a graph is shown when widget is refreshed, set alternatingCounter to match the graph currently shown
			epics.forEach(function (epic, i) {
				if ($("#burndown" + epic).css('opacity') == '1') {
					alternatingCounter = i;
					console.log('indexof alternatingCounter', i);
				}
			});

			// get epic summaries from all epics
			data.dev.epic.forEach(function (epic) {
				for (var k = 0; k < epics.length; k++) {
					if (epic.key == epics[k]) {
						epicSummaries[k] = epic.summary;
					}
				}
			});

			var sD = startDate.toString(); 
			var daycounter = data.dev.projectLength[0].startDate;
			var date;
			var burnData = {};
			var progress_done = {};
			var progress_total = {};
			var progress_remaining = {};
			var burnDays = {};
			var workDays = {};

			epics.forEach(function (epic) {
				burnData[epic] = [];
				workDays[epic] = {};
				burnDays[epic] = {};
				progress_done[epic] = 0;
				progress_total[epic] = 0;
				progress_remaining[epic] = 0;
			});
console.log("burnDays",burnDays);
			epics.forEach(function (epic) {
				data.dev.progress.forEach(function (issue) {
					if (issue.worklog.total > 0 && issue.epic == epic) { 
						progress_done[epic] = progress_done[epic] + (issue.progress.progress / 3600); // if issue has worklogs, add issue's progress done to epic's progress done
						progress_total[epic] = progress_total[epic] + (issue.progress.total / 3600); // and issue's total progress to epic's total progress


						/*
						Add worklog time spent in seconds to workDays
						workDays == every date that has work done on:
						workDays[epicKey][dd.mm.yyyy][timeSpentSeconds]
						*/
						issue.worklog.worklogs.forEach(function (wlog) {
							date = new Date(wlog.started);
							dd = date.getDate();
							mm = date.getMonth() + 1;
							yyyy = date.getFullYear();

							if (workDays[epic][dd + '.' + mm + '.' + yyyy]) {
								workDays[epic][dd + '.' + mm + '.' + yyyy] = workDays[epic][dd + '.' + mm + '.' + yyyy] + wlog.timeSpentSeconds;
							}
							else {
								workDays[epic][dd + '.' + mm + '.' + yyyy] = wlog.timeSpentSeconds;
							}
						})
					}
				});
				progress_remaining[epic] = progress_total[epic] - progress_done[epic]; // estimated progress remaining by epic

				if (days > 0) {
					var hoursLeft = progress_total[epic];
					var x = 0; // growing identifier for burnDays
					var burndownDate = new Date(sD); // burndownDate starts at project startDate
					var dateNow = new Date();

					/*
					Add estimated hours remaining on each day, from project start date to current date.
					burnDays == every day from project start to current day:
					burnDays[epicKey][x - date: dd.mm.yyyy][hoursLeft]
					*/
					while (+burndownDate <= +dateNow) {
						dd = burndownDate.getDate();
						mm = burndownDate.getMonth() + 1;
						yyyy = burndownDate.getFullYear();

						if (workDays[epic][dd + '.' + mm + '.' + yyyy]) {
							hoursLeft = hoursLeft - (workDays[epic][dd + '.' + mm + '.' + yyyy] / 3600)
						}
						burnDays[epic][x + ' - date: ' + dd + '.' + mm + '.' + yyyy] = hoursLeft;
						burndownDate.setDate(burndownDate.getDate() + 1);
						x++;
					}
				}

				var burnKey = 0;
				for (var i in burnDays[epic]) { // data from burnDays in a simpler table to display on the graph
					burnData[epic][burnKey] = burnDays[epic][i];
					burnKey++;
				}

			});
			var averageBurnValue, expectedBurnValue;
			var startWork = false;
			var ctx = {};
			var currentGraph = 0; // stores the index of currently shown epic
			var currentGraphIndex;
			epicSummaries.forEach(function (epic) { // check the graph title to see currently shown epic
				if ($("#title").text() == 'Development graph - ' + epic) {
					currentGraphIndex = epics[epicSummaries.indexOf(epic)];
					currentGraph = epics.indexOf(currentGraphIndex);
				}
			});

			$('.content', el).empty();
			$('.content').off('click');

			// generate epic selection and alternating buttons
			$('.content', el).append("<div class='dropdown'></div>");
			$('.dropdown', el).append("<button class='menubtn' id='btnAlternating'>Alternating</button>");
			$('.dropdown', el).append('<button id="epicsBtn" class="menubtn">Epics</button>');
			$('.dropdown', el).append("<div id='dropDiv' class='dropdown-content'></div>");

			$('.content').on('click', '#epicsBtn', function () {
				elem = document.getElementById("dropDiv");
				elem.classList.toggle('showmenu');
			});

			$('.content').on('click', '#btnAlternating', function (event) {
				alternating = true;
				console.log(alternating);
			});

			$('.content').on('click', '.eventBtn', function (event) {
				alternating = false;
				changeGraph(epics, epics.indexOf(event.currentTarget.value), false, true);
			});

			epics.forEach(function (epic) {
				if (epics.indexOf(epic) == currentGraph) { // create html canvas for each epic
					$('.content', el).append("<canvas style='z-index:1;position:absolute;' id='burndown" + epic + "'></canvas>");
				}
				else { // if the canvas id doesn't match currentGraph set opacity to 0
					$('.content', el).append("<canvas style='z-index:1;position:absolute;opacity:0;' id='burndown" + epic + "'></canvas>");
				}

				$('.dropdown-content', el).append("<button id='btn" + epic + "' value='" + epic + "' class='eventBtn'>" + epicSummaries[epics.indexOf(epic)] + "</button>");

				var remainingHours = progress_total[epic]; // chart y-axis
				var actualData = burnData[epic];

				// averageData == burndown ideal (red line)
				var averageData = generateAverageData();
				function generateAverageData() {
					var sum = 0;
					if (days) {
						var average = remainingHours / (days - 1);
					}
					averageBurnValue = average;
					startWork = average > 0;
					var data = [];
					i = 0;

					data[i] = remainingHours;
					if (days) {
						while (i < days - 1) {
							data[i + 1] = data[i] - average;
							i++;
						}
					}
					else {
						while (true && startWork) {
							data[i] = remainingHours - average * (i + 1);
							if (data[i] <= 0) break;
							i++;
						}
					}
					return data;
				}

				// line chart data (red line = ideal, blue line = actual)
				var ChartData = {
					labels: daysTable,
					datasets: [{
						type: 'line',
						label: 'Actual Hours Remaining',
						backgroundColor: "rgba(66, 135, 183, 0.3)",
						data: actualData,
						borderColor: 'rgba(108, 133, 153, 1)',
						borderWidth: 2,
						pointRadius: 1,
						tension: 0
					}, {
						type: 'line',
						tension: 0,
						label: 'Ideal Hours Remaining',
						backgroundColor: "rgba(255,99,132, 0)",
						data: averageData,
						borderColor: "rgba(255,99,132,1)",
						borderWidth: 2,
						pointRadius: 1,
						tension: 0
					}
					]
				};
				
				Chart.defaults.global.defaultFontColor = '#ffffff'; // chart global default font color
				ctx[epic] = document.getElementById("burndown" + epic).getContext("2d"); //attach html canvas to ctx
				ctx[epic].canvas.height = 250;

				window.myBar = new Chart(ctx[epic], { // draw the graph on canvas
					type: 'line',
					data: ChartData,
					options: {
						animation: false,
						responsive: true,
						title: {
							display: false,
							text: 'Burndown Chart'
						},
						scales: {
							yAxes: [{
								ticks: {
									max: remainingHours,
									min: 0,
								},
								display: true,
								scaleLabel: {
									display: true,
									labelString: 'Hours'
								}
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Days'
								}
							}]
						},
						tooltips: {
							enabled: true,
							mode: 'single',
							callbacks: {
								label: function (tooltipItems, data) {
									switch (tooltipItems.datasetIndex) {
										case 0:
											return remainingHours - (+tooltipItems.yLabel) + ' hr';
										case 1:
											return averageBurnValue + ' hr / day';
										default:
											return expectedBurnValue + ' hr / day';
											break;
									}
								},
								title: function (tooltipItems) {
									switch (tooltipItems[0].datasetIndex) {
										case 0:
											return 'Actual ' + '(' + tooltipItems[0].xLabel + ')';
										case 1:
											return 'Average (Velocity)';
										default:
											return 'Expected (Velocity)';
											break;
									}
								},
							}
						},
					}
				});
			});

			$('h2', el).text(data.title + " - " + epicSummaries[alternatingCounter]);

			if (graphInterval == true) { // start graph alternating interval when the page is first loaded
				var interval = window.setInterval(function () {
					if (alternatingCounter < epics.length - 1) {
						alternatingCounter++;
					} else {
						alternatingCounter = 0;
					}
					changeGraph(epics, alternatingCounter, true, false);
					console.log("alternatingCounter", alternatingCounter);
				}, 15000);
			}
			graphInterval = false;
		};
	}
};