const path = require('path');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const crypto = require("crypto");

const app = express();

// Connect to MongoDB
var mongoDB = process.env.MONGO_URL;
var flag = true
while(flag) {
	mongoose.connect(mongoDB, { useNewUrlParser: true }, function(err) {
	  if (err) throw err
	  else flag = false
	});
}
console.log("Connected to MongoDB at '" + mongoDB + "'")

// Use global promise
mongoose.Promise = global.Promise;
// Get connection
var db = mongoose.connection;
// On error callback
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Configure body parser
app.use(bodyParser.urlencoded({
    logimit: '100mb',
    extended: true
}));
app.use(bodyParser.json({limit: '100mb', extended: true}));

// Configure session
app.use(session({
  secret: crypto.randomBytes(32).toString('hex'),
  resave: true,
  saveUninitialized: true
}));

// Import routes
const indexRoutes = require('./routes/index');

// Settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Express middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/static'));

// Routes
app.use('/', indexRoutes);

// Server start
app.listen(app.get('port'), ()=>{
  console.log(`Server on port ${app.get('port')}`);
});
