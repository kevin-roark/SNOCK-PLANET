
module.exports.clearScene = function(scene, meshes, exceptions) {
  if (!scene) return;
  if (!meshes) meshes = scene.children;
  if (!exceptions) exceptions = [];

  for (var i = meshes.length - 1; i >= 0; i--) {
    var obj = meshes[i];
    if (meshes.indexOf(obj) === -1) {
      scene.remove(obj);
    }
  }
}
