const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const router = express.Router();
const mongoose = require('mongoose');
const request = require('request');

function sha512(password, salt) {
	var hash = crypto.createHmac('sha512', salt);
	hash.update(password);
	return hash.digest('hex');
};

function hashPassword(password, salt) {
	var hash = sha512(password, salt);
	return hash;
}

router.get('/', function(req, res) {
	res.redirect("/login")
});

router.get('/login', function(req, res) {
	res.render('login')
});

router.post('/login_post', async(req, res) => {
	// Get login parameters
	var username = req.body.username;
	var password = req.body.password;
	var sa = crypto.randomBytes(16).toString('hex')
	// Check empty parameters
	if(username == "" || password == "") {
		res.redirect("/?error=login_failed")
	}

	// Find in database
	var db = mongoose.connection;
	var collection = db.collection('users');
	result = await collection.find({"username": username}).toArray();

	// User not found
	if (result.length == 0) {
		res.redirect("/?error=login_failed")
		return
	}

	// Check credentials
	var salt = result[0]["salt"];
	var correctPassword = result[0]["password"];
	var saltedPassword = hashPassword(password, salt);
	if(correctPassword == saltedPassword){
		req.session.loggedIn = true;
		req.session.username = username;
		req.session.user_id = result[0]["_id"];
		res.redirect("/dashboard");
	}else{
		res.redirect("/?error=login_failed")
	}
});

router.post('/new_terrain', async(req, res) => {
	data = {"lat": req.body.lat, "lon": req.body.lon, "area": req.body.area,
		"waterfactor": req.body.waterfactor, "cropfactor": req.body.cropfactor,
		"terrain_name": req.body.terrain_name, "vertexlist": req.body.vertexlist}
	data["owner"] = mongoose.Types.ObjectId(req.session.user_id)
	mongoose.connection.collection('terrains').insertOne(data)
	res.sendStatus(200);
});

router.post('/update_terrain', async(req, res) => {
	terrain_id = mongoose.Types.ObjectId(req.body.terrain_id)
	data = {"lat": req.body.lat, "lon": req.body.lon, "area": req.body.area,
		"waterfactor": req.body.waterfactor, "cropfactor": req.body.cropfactor,
		"terrain_name": req.body.terrain_name}
	console.log(terrain_id)
	console.log(data)
	mongoose.connection.collection('terrains').update({"_id": terrain_id}, {"$set": data})
	res.sendStatus(200);
});

router.get('/get_terrains', async(req, res) => {
	uuid = mongoose.Types.ObjectId(req.session.user_id)

	// Find in database
	var result = []
	var db = mongoose.connection;
	var collection = db.collection('terrains');
	var terrains = await collection.find({"owner": uuid}).toArray()

	for (let index = 0; index < terrains.length; index++) {
		terrain = terrains[index]
		terrain_data = {"name": terrain["terrain_name"], "id": terrain["_id"], "sensors": []}

		var collection = db.collection('asignacion_sensores');
		var sensores = await collection.find({"terrain_id": terrain["_id"]}).toArray()
		sensores.forEach(function(sensor, index) {
			terrain_data["sensors"].push({"id": sensor["_id"], "name": sensor["name"]})
		});

		result.push(terrain_data)
	}

	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
});

router.get('/get_sensordata', async(req, res) => {
    sensor_id = req.query.id
	var db = mongoose.connection;
	var collection = db.collection('sensores');
	var data = await collection.find({"sensor_id": mongoose.Types.ObjectId(sensor_id)}).project({"value": 1, "datetime": 1, "_id": 0}).toArray()
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
})

router.get('/get_terraindata', async(req, res) => {
    terrain_id = req.query.id
	var db = mongoose.connection;
	var collection = db.collection('terrains');
	var data = await collection.find({"_id": mongoose.Types.ObjectId(terrain_id)}).toArray()
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data[0]));
})

router.get('/get_recommendation', async(req, res) => {
	// Get parameters
    terrain_id = req.query.id

	request.get('http://recommender:5000/recommendate?terrain_id=' + terrain_id, { json: true }, (err, res2, body)  => {
		if (err) { return console.log(err); }
		res.setHeader('Content-Type', 'application/json');
		res.send(body);
	});
})

router.get('/dashboard', function(req, res) {
	if(!req.session.loggedIn)
	{
		res.redirect("/login")
	} else {
		res.render('dashboard')
	}
});

module.exports = router;
