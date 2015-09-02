var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var handlebars = require('express-handlebars');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var marked = require('marked');
var nedb = require('nedb');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');

var db = new nedb();
db = {};
db.users = new nedb({ filename: 'data/users.db', autoload: true });
db.kb = new nedb({ filename: 'data/kb.db', autoload: true });

// markdown stuff
marked.setOptions({
	renderer: new marked.Renderer()
});

// require the routes
var index = require('./routes/index');

var app = express();

// view engine setup
app.engine('hbs', handlebars({ extname: 'hbs', defaultLayout: 'layout.hbs' }));
app.set('view engine', 'hbs');

// helpers for the handlebar templating platform
handlebars = handlebars.create({
    helpers: {
        split_keywords: function (keywords) { 
            var array = keywords.split(','); var links = "";
            for (var i = 0; i < array.length; i++) { 
                links += "<a href='/search/"+array[i].trim() +"'>"+array[i].trim() +"</a>&nbsp;|&nbsp;";
            }return links.substring(0, links.length - 1);
        },
        checked_state: function (state) { 
            if(state == "true"){
                return "checked"
                }else{return "";
            }
        },        
        ifCond: function (v1, operator, v2, options) {
			switch (operator) {
				case '==':
					return (v1 == v2) ? options.fn(this) : options.inverse(this);
				case '!=':
					return (v1 != v2) ? options.fn(this) : options.inverse(this);
				case '===':
					return (v1 === v2) ? options.fn(this) : options.inverse(this);
				case '<':
					return (v1 < v2) ? options.fn(this) : options.inverse(this);
				case '<=':
					return (v1 <= v2) ? options.fn(this) : options.inverse(this);
				case '>':
					return (v1 > v2) ? options.fn(this) : options.inverse(this);
				case '>=':
					return (v1 >= v2) ? options.fn(this) : options.inverse(this);
				case '&&':
					return (v1 && v2) ? options.fn(this) : options.inverse(this);
				case '||':
					return (v1 || v2) ? options.fn(this) : options.inverse(this);
				default:
					return options.inverse(this);
			}
		},
        is_an_admin: function (value, options) {
            if(value == "true") {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    }
});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.enable('trust proxy')
app.set('port', process.env.PORT || 4444);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('5TOCyfH3HuszKGzFZntk'));
app.use(session({
	expires: new Date(Date.now() + 60 * 10000),
	maxAge: 60 * 10000,
    resave: false,
    saveUninitialized: true,
    secret: "pAgGxo8Hzg7PFlv1HpO8Eg0Y6xtP7zYx"
}));

// serving static content
app.use(express.static('public'));

// Make stuff accessible to our router
app.use(function (req, res, next) {
	req.db = db;
	req.marked = marked;
	req.handlebars = handlebars;
    req.bcrypt = bcrypt;
	next();
});

// setup the routes
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// lift the app
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
