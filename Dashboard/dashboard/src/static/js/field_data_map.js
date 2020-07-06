// Map
var mapModify = null;
// Polygon
var polygonModify = null;
// Vertex
var vertexModify = [];
// Terrain id
modifiedTerrainId = null

// Initialize map
function terrainMap(id) {
	// Initial parameters
	var lat = 40.965277;
	var lon = -5.671184;
	var zoom = 5;
	var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET", "/get_terraindata?id=" + id, false);
    Httpreq.send(null);
    var terrain = JSON.parse(Httpreq.responseText);
	vertexModify = terrain["vertexlist"]
	modifiedTerrainId = id

	document.getElementById("terrain-lat").value = terrain["lat"]
	document.getElementById("terrain-lon").value = terrain["lon"]
	document.getElementById("terrain-area").value = terrain["area"]
	document.getElementById("terrain-name").value = terrain["terrain_name"]
	document.getElementById("modify-cf").value = "" + terrain["cropfactor"]
	document.getElementById("modify-rf").value = "" + terrain["waterfactor"]

	// Reset existing resources
	if(mapModify != null) {
		mapModify.remove()
	}

	// Create new map
	mapModify = L.map('field-data-map').setView([lat, lon], zoom);
	// Set tile layer
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(mapModify);
	polygonModify = L.polygon(vertexModify, {color: 'red'}).addTo(mapModify);
	mapModify.fitBounds(polygonModify.getBounds());
}

function updateTerrain() {
	// Get parameters
	var lat = parseFloat(document.getElementById("terrain-lat").value)
	var lon = parseFloat(document.getElementById("terrain-lon").value)
	var area = parseFloat(document.getElementById("terrain-area").value)
	var waterfactor = parseFloat(document.getElementById("input-rf-data").value)
	var cropfactor = parseFloat(document.getElementById("input-cf-data").value)
	var terrain_name = document.getElementById("terrain-name").value
	var vertexlist = vertex

	data = {"lat": lat, "lon": lon, "area": area, "waterfactor": waterfactor, "cropfactor": cropfactor,
		"terrain_name": terrain_name, "vertexlist": vertexlist, "terrain_id": modifiedTerrainId}

	var Httpreq = new XMLHttpRequest();
    Httpreq.open("POST", "/update_terrain", true);
	Httpreq.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    Httpreq.send(JSON.stringify(data));
	Httpreq.onloadend = function () {
		alert("Terrain updated succesfully")
		initMap()
	};
}
