
var $ = require('jquery');

var moveListeners = {};

$(document).mousemove(function(ev) {
  callListeners(moveListeners, ev);
});

function callListeners(listenersMap, ev) {
  for (var key in moveListeners) {
    var fn = moveListeners[key];
    if ('function' === typeof fn) {
      fn(ev.pageX, ev.pageY, ev);
    }
  }
}

module.exports.move = function(fn, key) {
  if (!key) key = 'default';
  moveListeners[key] = fn;
}

module.exports.clearMove = function(key) {
  if (!key) key = 'default';
  delete moveListeners[key];
}
