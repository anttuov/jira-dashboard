# 1 Installation

**Requirements**
* Nodejs

Make sure npm is installed on the server to make installation easier.
Make sure the server is running nodejs 0.8 or higher. If not run the command below.
```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```
Run the following command:
```
npm install -g atlasboard
```
Atlasboard should now be installed.



# 2 Configuring
## 2.1 Global configs
Set up global authentication for Jira on the server for Atlasboard to use.

```
nano ~/.bashrc

export JIRA_USER='user'
export JIRA_PASSWORD='password'
```
## 2.2 Atlasboard configs
Set up globalAuth.json as follows into atlasboard root directory.
```
{
    "jira":{
        "username":"${JIRA_USER}",
        "password":"${JIRA_PASSWORD}"
         }
}

```
Under the config directory setup auth.js as follows.
```
module.exports = {
   "authenticaticationFilePath": "globalAuth.json"
};

```
## 2.3 Dashboard configs
Under the config directory you can setup a dashboard_common.json
```
{
 "config" : {
  "jira-api": {
    "authname": "jira",
    "jira_server": *jira domain or ip*,
    "timeout":30000,
    "retryOnErrorTimes": 3,
    "projectName": *project Jira ID*
  }
    "jira-api2": {
    "authname": "jira",
    "jira_server": *jira domain or ip*,
    "timeout":30000,
    "retryOnErrorTimes": 3,
    "projectName": *project Jira ID*
  }
 }
}

```
Several Jira API's can be added by changing the naming.
These global configs can be used in different dashboards for widgets as config arguments.
```
"config": ["jira-api2, *widget*]
```

One widget dashboard example with the Qub1t Release View widget.
```
{
    "title": "Release view",
    "titleVisible": false,
  
    "description": "test",
  
    "layout": {
      "title": true,
      "customJS": ["md5.js", "jquery.peity.js", "Chart.bundle.min.js"],
      "gridSize" : { "columns" : 4, "rows" : 6 },
      "widgets": [{
        "enabled": true,
        "row": 1,
        "col": 1,
        "width": 4,
        "height": 6,
        "widget": "releaseview",
        "job": "releaseview",
        "config": ["jira-api2", "health"]
      }] },
  
    "config": {
      "health": {
        "retryOnErrorTimes": 3,
        "interval": 60000
      }
      }
    }

```
# 3 Atlasboard commands
Following commands require atlasboard as a prefix:

generate: generates a basic component of type dashboard, job or widget.
```
atlasboard generate dashboard mydashboard
atlasboard generate job myjob
atlasboard generate widget mywidget
```

new: generates a new dashboard project.
```
atlasboard new mywallboard
```

list: lists all available components(widgets or jobs) among all packages.
```
atlasboard list
```

start: starts Atlasboard's server. This is covered more thoroughly in chapters **4** and **4.1**

install: install package dependencies.

# 4 Running Atlasboard
Start by running the command: 
```
atlasboard start
```
This will run atlasboard on the default port specified in start.js which by default is port 3000. Running Atlasboard at a specific port not specified by start.js run:
```
atlasboard start portnumberhere
```
start.js can be found in the root directory of atlasboard.

## 4.1 Filtered running


```
atlasboard start --job myjob     // runs only the job specified.
atlasboard start --dashboard mydashboard   // runs the specified dashboard.
```
Both can be used with regular expressions. "my(.*)b" in case of the job and my(.*)board in case of the dashboard. Using regular expressions still requires **atlasboard start --whatyouwanttorun**

# 5 Qub1t widgets and jobs

## 5.1 Bugs
### 5.1.1 Description
Searches project specific bugs, sorts them by priority and displays them
### 5.1.2 Bugs-job
### 5.1.3 Bugs-widget

## 5.2 Development-graph
### 5.2.1 Description
Displays burndown charts for each epic of the project
### 5.2.2 Development-graph-job
The job makes an easyRequest to the specified Jira server and uses the Jira rest api to return data from *config.jira_server*/rest/api/2/search?*config.projectName*. The job then makes another easyRequest for every issue id returned by the first easyRequest to return worklogs, progress and epic(customfield_10000) from *config.jira_server*/rest/api/2/issue/*issue id*. The data is then sent to the widget and processed further.
### 5.2.3 Development-graph-widget
#### 5.2.3.1 Graph data
The widget first checks whether the incoming data is empty or not. If it's not empty it counts the project length using start date and release date. It then checks all the issues to get every epic present in the project. It then processes the worklog data and progress data to a table that has a cell for each day in the project until the current date. The data in the cell is the estimated working hours left on that day(*total estimated working hours* - *working hours done since project start*).
#### 5.2.3.2 Graph drawing
A graph is drawn for each epic using chart.js. 

#### 5.2.3.3 Alternating functionality
## 5.3 Dummy
### 5.3.1 Description
Uses the health widget data to display different smileyfaces depending on project status.

## 5.4 Find-users
### 5.4.1 Description
This component is used to fetch and display members of a project based on their roles in any given project. 
### 5.4.2 Find-users-job
The job makes an easyRequest to the specified Jira server and uses the Jira rest api to return data from *config.jira_server*/rest/api/2/*config.projectName*/role
That data is then sent to the widget and processed further.
### 5.4.3 Find-users-widget
The widget first checks whether the incoming data is empty or not. If it's not empty it sorts the incoming role names alphabetically. Then div elements are created for each project role. Members of each role are then appended to their respective role divs and have their Jira profiles linked.

## 5.5 General-info
### 5.5.1 Description
Displays project image, name and upcoming release date.
### 5.5.2 General-info job
The job makes a JSON easyRequest to the specified Jira server and uses the Jira REST API to return data for the widget. Fetched data includes project name, icons, links to the project in Jira and other general info. 
### 5.5.3 General-info widget
The widget displays the name, icon and next release date for the current project.

## 5.6 Health
### 5.6.1 Description
Health widget displays current project status by showing how many issues have status To Do / In Progress or Done.
### 5.8.2 Job
Gets all the issues of the project from REST Api with jql "project = project_name"
### 5.8.3 Widget
Categorizes issues by their status and displays them in a 3 part bar. Also shows time left in project and work done according to the estimates and worklog in jira.

## 5.7 Testing
### 5.7.1 Description
Displays tests as passed, failed or not started and can be segregated to UAT and Integration or show all tests.
### 5.7.2 Testing job
The job makes a JSON easyRequest to the specified Jira server and uses the Jira REST API to return data for the widget. Fetched data includes a link to test cases in jira, issue key, issue type and issue status among a few others. 
### 5.7.3 Testing widget
The widget uses the chart.js JavaScript library to generate a pie chart from the data received from the testing job and separates them into three slices: Not started, Failed and Passes. You can click on individual slices to go to a link in Jira that filters Test Cases to the selected status. You can also filter the tests to All, UAT and Integration.

## 5.8 User-stories
### 5.8.1 Description
Displays all user stories of the project, their status, summary, key and assignee.
### 5.8.2 Job
Gets all the user stories of the project from REST Api with jql "project = project_name AND type = Story"
### 5.8.3 Widget
Shows key, status, summary and assignee of all the user stories. Status is displayed with a "status circle", which changes color based on the status of the issue in jira.

# External links
### [Atlasboard bitbucket](https://bitbucket.org/atlassian/atlasboard)
### [Jira rest api](https://docs.atlassian.com/software/jira/docs/api/REST/7.6.1/)