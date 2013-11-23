var is = require('is');

var _vars = {
  map: {},

  newInfo: function() {
    return {
      count: 0,
      min: 0,
      max: 0,
      mean: 0,
      type: ""
    };
  },

  put: function(k, v) {
    var info = _vars.map[k];
    if(!is.defined(info)) {
      info = _vars.newInfo();
    }
    info.count += 1;
    info.type = (typeof v);
    _vars.map[k] = info;
    return info;
  },

  get: function(k) {
    return _vars.map.length > 0 ? _vars.map[k] : null;
  }
};

exports.list = function(req, res) {
  res.send(JSON.stringify(_vars.map));
};

exports.post = exports.put = function(req, res) {
  var v = req.body;
  if(!is.defined(v.name)) {
    res.status(400).send("Expected { name: 'foo', value: bar }");
  }
  res.send(JSON.stringify(_vars.put(v.name, v.value)));
};

exports.get = function(req, res) {
  var info = _vars.get(req.params.name);
  if(!is.defined(info)) {
    res.status(404).send("No info found for " + req.params.name);
  }
  res.send(JSON.stringify(info));
};
