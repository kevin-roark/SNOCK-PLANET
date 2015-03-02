
var $ = require('jquery');

var keydownMap = {};
var keyupMap = {};
var keypressMap = {};

$('body').keydown(function(ev) {
  callListener(keydownMap, ev);
});

$('body').keyup(function(ev) {
  callListener(keyupMap, ev);
});

$('body').keypress(function(ev) {
  console.log('key press eh? ' + ev.which);
  callListener(keypressMap, ev);
});

function callListener(listenerMap, ev) {
  var listener = getListener(listenerMap, ev.which);
  if (listener) {
    if (listener.preventDefault) {
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

function setListener(listener, listenerMap, keycodes, preventDefault) {
  if (!Array.isArray(keycodes) {
    keycodes = [keycodes]
  }

  for (var i = 0; i < keycodes.length; i++) {
    var keycode = keycodes[i];
    listenerMap[keycode + ''] = {
      fn: listener,
      preventDefault: preventDefault
    };
  }
}

function clearListener(listenerMap, keycode) {
  if (keycode) {
    listenerMap[keycode + ''] = undefined;
  } else {
    for (var key in listenerMap) {
      listenerMap[key] = undefined;
    }
  }
}

/* exports */

module.exports.keydown = function(keycodes, preventDefault, listener) {
  setListener(listener, keydownMap, keycodes, preventDefault);
};

module.exports.keyup = function(keycodes, preventDefault, listener) {
  setListener(listener, keyupMap, keycodes, preventDefault);
};

module.exports.keypress = function(keycodes, preventDefault, listener) {
  setListener(listener, keypressMap, keycodes, preventDefault);
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
