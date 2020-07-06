//On load function______________________________________________________________
$(document).ready(async function(){
  // Create nav menu
  await loadNav();

  // Load icons
  feather.replace({ class: 'hrg', 'width': 512, 'height': 512 })
  feather.replace()

  // Collapsible listeners
  collapsibleListeners();

  // Hide secondary sections
  $("#chart-section").hide();
  $("#terrain-data-section").hide();
  $("#create-terrain-section").hide();
  $("#chart-section").hide();
  $("#recommendation-section").hide();
});
//______________________________________________________________________________


// Option select functions______________________________________________________

// Load section "add terrain"
function loadAddTerrain(){
  // Hide all and show create terrain section
  $("#welcome-section").hide();
  $("#terrain-data-section").hide();
  $("#create-terrain-section").show();
  $("#chart-section").hide();
  $("#recommendation-section").hide();

  // Change tittle p content
  var p = document.getElementById("tittle_p");
  p.innerHTML = "Añadir terreno"
}

// Load section "terrain data"
function loadTerrainData(terrain_id){
	terrainMap(terrain_id)
  // Hide all and show load terrain data
  $("#welcome-section").hide();
  $("#terrain-data-section").show();
  $("#create-terrain-section").hide();
  $("#chart-section").hide();
  $("#recommendation-section").hide();

  // Change tittle p content
  var p = document.getElementById("tittle_p");
  p.innerHTML = "Datos del terreno"
}

// Load section "sensor section"
function loadSensorSection(sensorid){
  // Hide all and show load sensor data
  $("#welcome-section").hide();
  $("#terrain-data-section").hide();
  $("#create-terrain-section").hide();
  $("#chart-section").show();
  $("#recommendation-section").hide();

  // Change tittle p content
  var p = document.getElementById("tittle_p");
  p.innerHTML = "Datos del sensor"

	// Get sensor data
	var Httpreq = new XMLHttpRequest();
	Httpreq.open("GET", "/get_sensordata?id=" + sensorid, false);
	Httpreq.send(null);
	var data = JSON.parse(Httpreq.responseText)
	sensorChart(data);
}

function sensorChart(data){
  // Themes begin
  am4core.useTheme(am4themes_animated);
  // Themes end

  // Create chart instance
  var chart = am4core.create("sensor-chart", am4charts.XYChart);

  // Add data
  chart.data = data;

  // Set input format for the dates
  chart.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm:ss";

  // Create axes
  var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

  // Create series
  var series = chart.series.push(new am4charts.LineSeries());
  series.dataFields.valueY = "value";
  series.dataFields.dateX = "datetime";
  series.tooltipText = "{value}"
  series.strokeWidth = 2;
  series.minBulletDistance = 15;

  // Drop-shaped tooltips
  series.tooltip.background.cornerRadius = 20;
  series.tooltip.background.strokeOpacity = 0;
  series.tooltip.pointerOrientation = "vertical";
  series.tooltip.label.minWidth = 40;
  series.tooltip.label.minHeight = 40;
  series.tooltip.label.textAlign = "middle";
  series.tooltip.label.textValign = "middle";

  // Make bullets grow on hover
  var bullet = series.bullets.push(new am4charts.CircleBullet());
  bullet.circle.strokeWidth = 2;
  bullet.circle.radius = 4;
  bullet.circle.fill = am4core.color("#fff");

  var bullethover = bullet.states.create("hover");
  bullethover.properties.scale = 1.3;

  // Make a panning cursor
  chart.cursor = new am4charts.XYCursor();
  chart.cursor.behavior = "panXY";
  chart.cursor.xAxis = dateAxis;
  chart.cursor.snapToSeries = series;

  // Create vertical scrollbar and place it before the value axis
  chart.scrollbarY = new am4core.Scrollbar();
  chart.scrollbarY.parent = chart.leftAxesContainer;
  chart.scrollbarY.toBack();

  // Create a horizontal scrollbar with previe and place it underneath the date axis
  chart.scrollbarX = new am4charts.XYChartScrollbar();
  chart.scrollbarX.series.push(series);
  chart.scrollbarX.parent = chart.bottomAxesContainer;

  dateAxis.start = 0.79;
  dateAxis.keepSelection = true;
}

// Load section "recommendation section"
function loadRecommendationSection(terrain_id){
  // Hide all and show load sensor data
  $("#welcome-section").hide();
  $("#terrain-data-section").hide();
  $("#create-terrain-section").hide();
  $("#chart-section").hide();
  $("#recommendation-section").show();

  // Change tittle p content
  var p = document.getElementById("tittle_p");
  p.innerHTML = "Recomendaciones"

	// Get recommendation
	var Httpreq = new XMLHttpRequest();
	Httpreq.open("GET", "/get_recommendation?id=" + terrain_id, false);
	Httpreq.send(null);
	var data = JSON.parse(Httpreq.responseText)

  hrg = data["hargreaves"];
  rfr = data["rfr"];
  gbr = data["gbr"];

  loadPieChart(Object.values(data).filter(v => v).length, Object.values(data).filter(v => !v).length);


  // TODO: Change methods span clases
}


function loadPieChart(total_true,total_false){
  // Themes begin
  am4core.useTheme(am4themes_animated);
  // Themes end

  // Create chart instance
  var chart = am4core.create("rec-chart-div", am4charts.PieChart);

  // Add and configure Series
  var pieSeries = chart.series.push(new am4charts.PieSeries());
  pieSeries.dataFields.value = "count";
  pieSeries.dataFields.category = "value";

  // Let's cut a hole in our Pie chart the size of 30% the radius
  chart.innerRadius = am4core.percent(30);

  // Put a thick white border around each Slice
  pieSeries.slices.template.stroke = am4core.color("#fff");
  pieSeries.slices.template.strokeWidth = 2;
  pieSeries.slices.template.strokeOpacity = 1;
  pieSeries.slices.template
    // change the cursor on hover to make it apparent the object can be interacted with
    .cursorOverStyle = [
      {
        "property": "cursor",
        "value": "pointer"
      }
    ];

  pieSeries.alignLabels = false;
  pieSeries.labels.template.bent = true;
  pieSeries.labels.template.radius = 3;
  pieSeries.labels.template.padding(0,0,0,0);

  pieSeries.ticks.template.disabled = true;

  // Create a base filter effect (as if it's not there) for the hover to return to
  var shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
  shadow.opacity = 0;

  // Create hover state
  var hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

  // Slightly shift the shadow and make it more prominent on hover
  var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
  hoverShadow.opacity = 0.7;
  hoverShadow.blur = 5;

  // Add a legend
  chart.legend = new am4charts.Legend();

  chart.data = [{
    "value": "Regar",
    "count": total_true,
    "color": am4core.color("#00CC00")
  },{
    "value": "No regar",
    "count": total_false,
    "color": am4core.color("#CC0000")
  }];

  pieSeries.slices.template.propertyFields.fill = "color";
}
//______________________________________________________________________________




// Load Nav Auxiliar Functions _________________________________________________
function collapsibleListeners(){
  // collapsible listeners
  var coll = document.getElementsByClassName("collapsible");
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  }
}


async function recoverData(){
	var Httpreq = new XMLHttpRequest();
	Httpreq.open("GET", "/get_terrains", false);
	Httpreq.send(null);
	var data = JSON.parse(Httpreq.responseText)

	return data
}

function loadTerrainDataOption(terrains){
  var ul_terrain = document.getElementById("terrain-data-ul");
  for(terrain of terrains){
      var sensors = terrain["sensors"];
      var terrain_name = terrain["name"];
	  var terrain_id = terrain["id"];

      // Create terrain li and set its properties
      var li_terrain = document.createElement("li");
      li_terrain.setAttribute("class","nav-item");
      li_terrain.setAttribute("style","padding: .5rem 1rem;");

      // Create terrain li span
      var span_terrain = document.createElement("span");
      span_terrain.setAttribute("data-feather", "feather");
      li_terrain.appendChild(span_terrain);

      // Create terrain li button
      var button_terrain = document.createElement("button");
      button_terrain.setAttribute("class", "collapsible btn btn-outline-secondary");
      button_terrain.setAttribute("type", "button");
      button_terrain.setAttribute("onclick", "loadTerrainData('" + terrain_id + "')");
      button_terrain.setAttribute("style", "width:85%;height:2.2em;");
      button_terrain.innerHTML = terrain_name;
      li_terrain.appendChild(button_terrain);

      // Create li terrain content div
      var content_div_terrain = document.createElement("div");
      content_div_terrain.setAttribute("class","content");
      content_div_terrain.setAttribute("style","display: none;overflow: hidden;margin-top:1em;");

      // Create content div terrain ul
      var ul_sensor =  document.createElement("ul");
      ul_sensor.setAttribute("id","terrain-data-sensors-ul");
      ul_sensor.setAttribute("class","nav flex-column mb-2");

      // Create ul sensor li
      for(sensor of sensors){
		  var sensorid = sensor["id"]
		  sensor = sensor["name"]
        // Create sensor li and set its properties
        var li_sensor = document.createElement("li");
        li_sensor.setAttribute("class","nav-item");
        li_sensor.setAttribute("style","padding: .5rem 1rem;");

        // Create sensor li span
        var span_sensor = document.createElement("span");
        span_sensor.setAttribute("data-feather", "bar-chart-2");
        li_sensor.appendChild(span_sensor);

        // Create sensor li button
        var button_sensor = document.createElement("button");
        button_sensor.setAttribute("class", "btn btn-outline-success");
        button_sensor.setAttribute("type", "button");
        button_sensor.setAttribute("onclick", "loadSensorSection('" + sensorid + "')");
        button_sensor.setAttribute("style", "width:80%;height:2.2em;");
        button_sensor.innerHTML = sensor;
        li_sensor.appendChild(button_sensor);


        ul_sensor.appendChild(li_sensor);
      }


      content_div_terrain.appendChild(ul_sensor);
      li_terrain.appendChild(content_div_terrain);
      ul_terrain.appendChild(li_terrain);
  }
}

function loadTerrainRecommendationsOption(terrains){
  var ul_recommendations = document.getElementById("terrain-recommendation-div");
  for(terrain of terrains){
      var terrain_name = terrain["name"];
	  var terrain_id = terrain["id"]

      // Create terrain li and set its properties
      var li_terrain = document.createElement("li");
      li_terrain.setAttribute("class","nav-item");
      li_terrain.setAttribute("style","padding: .5rem 1rem;");

      // Create terrain li span
      var span_terrain = document.createElement("span");
      span_terrain.setAttribute("data-feather", "feather");
      li_terrain.appendChild(span_terrain);

      // Create terrain li button
      var button_terrain = document.createElement("button");
      button_terrain.setAttribute("class", "btn btn-outline-success");
      button_terrain.setAttribute("type", "button");
      button_terrain.setAttribute("onclick", "loadRecommendationSection('" + terrain_id + "')");
      button_terrain.setAttribute("style", "width:85%;height:2.2em;");
      button_terrain.innerHTML = terrain_name;
      li_terrain.appendChild(button_terrain);

      ul_recommendations.appendChild(li_terrain);
  }
}
//______________________________________________________________________________


// Load Nav Function____________________________________________________________
async function loadNav(){
  //Get Terrains
  var terrains = await recoverData();

  // Load terain data option
  loadTerrainDataOption(terrains);

  // Load recommendation options
  loadTerrainRecommendationsOption(terrains);
}
//______________________________________________________________________________
