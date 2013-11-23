// Module dependencies.
var express = require('express');
var routes = require('./routes');
var api = require('./routes/api');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var varjs = express();

// all environments
varjs.set('port', process.env.PORT || 1221);
varjs.set('views', path.join(__dirname, 'views'));
varjs.set('view engine', 'jade');
varjs.use(express.favicon());
varjs.use(express.logger('dev'));
varjs.use(express.json());
varjs.use(express.urlencoded());
varjs.use(express.methodOverride());
varjs.use(varjs.router);
varjs.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
varjs.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == varjs.get('env')) {
  varjs.use(express.errorHandler());
}

varjs.get('/', routes.index);
varjs.get('/users', user.list);

varjs.get('/vars', api.vars.list);
varjs.post('/vars', api.vars.post);
varjs.get('/vars/:name', api.vars.get);
varjs.put('/vars/:name', api.vars.put);

http.createServer(varjs).listen(varjs.get('port'), function(){
  console.log('varjs listening on port ' + varjs.get('port'));
});
