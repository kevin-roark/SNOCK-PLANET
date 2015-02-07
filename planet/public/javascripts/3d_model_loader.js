
var cache = {};

module.exports = function loadModel(name, callback) {
  if (typeof callback !== 'function') return;

  if (cache[name]) {
    callback(fetch(name, true));
  }

  var loader = new THREE.JSONLoader;
  loader.load(name, function(geometry, materials) {
    add(geometry, materials);
    callback(fetch(name));
  });
};

function add(name, geometry, materials) {
  cache[name] = {
    geometry: geometry,
    materials: materials
  }
}

function fetch(name, clone) {
  if (!clone) {
    return cache[name];
  }

  return {
    geometry: cache[name].geometry.clone(),
    materials: cache[name].geometry.clone()
  }
}
