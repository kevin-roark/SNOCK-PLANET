
var cache = {};

module.exports = function loadModel(name, callback) {
  if (typeof callback !== 'function') return;

  if (cache[name]) {
    fetch(name, true, callback);
  }

  var loader = new THREE.JSONLoader;
  loader.load(name, function(geometry, materials) {
    add(geometry, materials);
    fetch(name, false, callback);
  });
};

function add(name, geometry, materials) {
  cache[name] = {
    geometry: geometry,
    materials: materials
  }
}

function fetch(name, clone, callback) {
  if (!clone) {
    callback(cache[name].geometry, cache[name].materials);
    return;
  }

  callback(cache[name].geometry.clone(), cache[name].materials.clone());
}
