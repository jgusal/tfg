// Map
var map = null;
// Polygon
var polygon = null;
// Vertex
var vertex = [];

initMap();


// Initialize map
function initMap() {
	// Initial parameters
	var lat = 40.965277;
	var lon = -5.671184;
	var zoom = 5;

	// Reset existing resources
	if(map != null) {
		map.remove()
		vertex = [];
		document.getElementById("new-terrain-lat").value = "..."
		document.getElementById("new-terrain-lon").value = "..."
		document.getElementById("new-terrain-area").value = "..."
		document.getElementById("name-create").value = ""
	}

	// Create new map
	map = L.map('create_terrain')
		.setView([lat, lon], zoom)
		.on('click', function(ev) {
			addVertex(ev.latlng)
		});

	// Set tile layer
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
}

// OnClick callback
function addVertex(latlng) {
	// Store new vertex
	vertex.push([latlng.lat, latlng.lng])
	// Create polygon
	if(polygon != null)
		polygon.remove()
	if(vertex.length < 3) {
		polygon = L.polyline(vertex, {color: 'red'}).addTo(map);
	} else {
		polygon = L.polygon(vertex, {color: 'red'}).addTo(map);

		centroid = geometric.polygonCentroid(vertex)
		area = L.GeometryUtil.geodesicArea(polygon.getLatLngs()[0])

		document.getElementById("new-terrain-lat").value = centroid[0]
		document.getElementById("new-terrain-lon").value = centroid[1]
		document.getElementById("new-terrain-area").value = area
	}
}

// Address to coordinates
function getCoordinates(address) {
	var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET", "https://nominatim.openstreetmap.org/search?q=" + address + "&format=json", false);
    Httpreq.send(null);

    var geo = JSON.parse(Httpreq.responseText);

	try {
		var lat = geo[0].lat;
		var lon = geo[0].lon;
		return {"lat": lat, "lon": lon};
	} catch (e) {
		return null;
	}
}

function createTerrain() {
	if(vertex.length < 3)
	{
		alert("Debe definir un poligono para marcar el terreno")
		return
	}

	// Get parameters
	var lat = parseFloat(document.getElementById("new-terrain-lat").value)
	var lon = parseFloat(document.getElementById("new-terrain-lon").value)
	var area = parseFloat(document.getElementById("new-terrain-area").value)
	var waterfactor = parseFloat(document.getElementById("modify-rf").value)
	var cropfactor = parseFloat(document.getElementById("modify-cf").value)
	var terrain_name = document.getElementById("name-create").value
	var vertexlist = vertex

	data = {"lat": lat, "lon": lon, "area": area, "waterfactor": waterfactor, "cropfactor": cropfactor,
		"terrain_name": terrain_name, "vertexlist": vertexlist}

	var Httpreq = new XMLHttpRequest();
    Httpreq.open("POST", "/new_terrain", true);
	Httpreq.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    Httpreq.send(JSON.stringify(data));
	Httpreq.onloadend = function () {
		alert("Terrain added succesfully")
		initMap()
	};
}

// Update address on press 'Enter'
$(document).on('keypress',function(e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == '13') {
		if(document.activeElement.id == "addresstext") {
			coords = getCoordinates(document.activeElement.value);
			if(coords) {
				map.flyTo(coords, 18);
			}
		}
    }
});
