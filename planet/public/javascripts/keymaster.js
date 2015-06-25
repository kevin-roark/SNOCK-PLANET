
var $ = require('jquery');

var keydownMap = {};
var keyupMap = {};
var keypressMap = {};
var shouldPreventDefaults = false;

$('body').keydown(function(ev) {
  callListener(keydownMap, ev);
});

$('body').keyup(function(ev) {
  callListener(keyupMap, ev);
});

$('body').keypress(function(ev) {
  callListener(keypressMap, ev);
});

function callListener(listenerMap, ev) {
  var listener = getListener(listenerMap, ev.which);
  if (listener) {
    if (shouldPreventDefaults) {
      ev.preventDefault();
    }

    if ('function' === typeof listener.fn) {
      listener.fn(ev);
    }
  }
}

function getListener(listenerMap, keycode) {
  return listenerMap[keycode + ''];
}

function setListener(listener, listenerMap, keycodes) {
  if (!Array.isArray(keycodes)) {
    keycodes = [keycodes];
  }

  for (var i = 0; i < keycodes.length; i++) {
    var keycode = keycodes[i];
    listenerMap[keycode + ''] = {
      fn: listener
    };
  }
}

function clearListener(listenerMap, keycode) {
  if (keycode) {
    listenerMap[keycode + ''] = undefined;
  } else {
    for (var key in listenerMap) {
      if (listenerMap.hasOwnProperty(key)) {
        delete listenerMap[key];
      }
    }
  }
}

/* exports */

module.exports.keydown = function(keycodes, listener) {
  setListener(listener, keydownMap, keycodes);
};

module.exports.keyup = function(keycodes, listener) {
  setListener(listener, keyupMap, keycodes);
};

module.exports.keypress = function(keycodes, listener) {
  setListener(listener, keypressMap, keycodes);
};

module.exports.clearKeydownListener = function(keycode) {
  clearListener(keydownMap, keycode);
};

module.exports.clearKeyupListener = function(keycode) {
  clearListener(keyupMap, keycode);
};

module.exports.clearKeypressListener = function(keycode) {
  clearListener(keypressMap, keycode);
};

module.exports.setPreventDefaults = function(preventDefaults) {
  shouldPreventDefaults = preventDefaults;
};
