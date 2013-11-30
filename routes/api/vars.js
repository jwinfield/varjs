var JSON2 = require('JSON2');
var is = require('is');

var _vars = {
  map: {},

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
  saveInfo: function(k, v, t) {
    var info = _vars.map[k];
    if(!is.defined(info)) {
      info = _vars.newInfo(k, t || (typeof v));
      _vars.map[k] = info;
    }
    info.count += 1;
    return info;
  },

  // Get info on a var with the specified key
  get: function(k) {
    return _vars.map[k];
  },

  // Put info on a var with the specified key
  put: function(k, v) {
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
  res.json(_vars.map);
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
  res.json(_vars.get(v.name));
};

// http GET info stats for a named value
exports.get = function(req, res) {
  var info = _vars.get(req.params.name);
  if(!is.defined(info)) {
    res.status(404).send("No info found for " + req.params.name);
  }
  res.json(info);
};

