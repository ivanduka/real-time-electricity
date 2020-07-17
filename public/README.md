# Realtime Electricity Dashboard Pilot
Project Manager: Kevin Caron

This is a proof-of-concept project to demonstrate the ability to obtain data from each province's utility operator in real time and display it in charts.

## Instructions for Accessing Charts Updating Realtime from the Database

NOTE: This is an INTERIM solution until we can get a web service up and running to connect "properly" to the CERSEI database.

* Log in through RDP
* Ensure you have Windows Authentication access to the CERSEI EnergyData database
* Open Internet Explorer 11
* Change the following security settings in IE 11 
    * Note: This is generally NOT recommended for security reasons. Ensure you change these back!
    * Menu > Internet Options > Security Settings > Internet > Custom
        * Miscellaneous: Data security across domains (enable)
    * Menu > Internet Options > Security Settings > Trusted Sites > Custom
        * Initialize and script active X controls is not marked safe for scripting (enable)
        * Display mixed content (enable)
    * Add dweb5.cer-rec.gc.ca/rte to Trusted Sites
* Access the website through http://dweb5.cer-rec.gc.ca/rte/index.html
* F12 to view console
* If many errors are happening, you may need to refresh, restart IE, or clear cache.
* Charts should update by themselves to get the latest data

### To update code

* Main page is index.html
* Dependencies are in plugins folder
* All chart code is in charts.js
    * Charts are specified in the charts array. Several assumptions made here; see note in comments. As long as data structure is reasonably consistent, for the most part to add a new chart you only need to add a chart to this array. 
    * If "enabled" is set to true for a chart, it will get created during page initialization
    * Style + chart options have been modularized. This could be pushed further. 
    * Note that each chart needs a specific divId existing in index-db.html

### Known Issues with this implementation

* Time zones are not currently working; this is either due to data issues or to the fact that highcharts uses moment.js for its timezone conversion. Moment.js causes some errors in IE11. This issue has not been fully investigated.
* Only charts with a DateTime column can be accommodated.
* Data in database has inconsistent structure.
* Only a subset of the latest data is taken from the database for performance reasons.
* Unsure what happens to updateChartFromDB if a chart is hidden. Will it continue to run on the interval?

## TODO

Short-term:

[ ] Set up non-ActiveX DB connection / connect to Ivan's web service
[ ] Set style for subtitle and description
[ ] Update colour scheme, esp. for charts with multiple series
[ ] Add placeholder divs for Ontario charts
[ ] Add placeholder for NS/NB charts
[ ] Test data


Longer-term:

[ ] Fix timezone issues
[ ] Add Ontario, NS/NB data
[ ] Make this robus enough for internal CER use

Design:
[ ] Create full dashboard design mockup (in progress)


