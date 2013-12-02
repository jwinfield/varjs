var JSON2 = require('JSON2');
var is = require('is');

// Default store
var redis = require("redis"),
    store = redis.createClient();
    store.on("error", function (err) {
      console.log("Error: " + err);
    });

var _vars = {

  // Create a new var info instance
  newInfo: function(name, type) {
    return {
      name: name,
      type: type,
      count: 0,
      min: 0,
      max: 0,
      mean: 0
    };
  },

  // Save info for the specified key/value
  saveInfo: function(k, v, t, callback) {
    _vars.get(k, function(info) {
      if(info === null) {
        info = _vars.newInfo(k, t || (typeof v));
      }

      info.count += 1;
      store.hset('vars', k, JSON.stringify(info)); 

      if(is.fn(callback)) {
         callback(info);
      }
    });
  },

  // Get info on a var with the specified key
  get: function(k, callback) {
    if(is.fn(callback)) {
      store.hget('vars', k, function(err, data) {
        callback(JSON.parse(data));
      });
    }
  },

  // Get info on all vars
  all: function(callback) {
    if(is.fn(callback)) {
      store.hgetall('vars', function(err, data) {
        var vars = {};
        for(k in data) {
          vars[k] = JSON.parse(data[k]);
        }
        callback(vars);
      });
    }
  },

  // Put info on a var with the specified key
  put: function(k, v, callback) {
    if(is.array(v)) {
       for(i in v) {
         _vars.put(k, v[i]);
       }
    } else if(is.a(v, "object")) {
       _vars.saveInfo(k, '', "object");
       for(child in v) {
         _vars.put(k + '.' + child, v[child]);
       }
    } else {
      _vars.saveInfo(k + '.' + v, (typeof v));
      _vars.saveInfo(k, v);
    }
  }
};

// http GET info for all vars we have info on
exports.list = function(req, res) {
  _vars.all(function(all) {
    res.json(all);
  });
};

// http POST/PUT a value to the var info store Represented as
// { name: 'foo', value: bar }
// where bar represents any js value, primitive, complex, etc.
exports.post = exports.put = function(req, res) {
  var v = req.body;
  if(!is.defined(v.name)) {
    res.status(400).send("Expected { name: 'foo', value: bar }");
  }
  _vars.put(v.name, JSON2.decycle(v.value));
  res.status(200).end();
};

// http GET info stats for a named value
exports.get = function(req, res) {
  _vars.get(req.params.name, function(info) {
    if(!is.defined(info)) {
      res.status(404).send("No info found for " + req.params.name);
    }
    res.json(info);
  });
};

