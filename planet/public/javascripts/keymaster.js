
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

function setListener(listener, listenerMap, keycode, preventDefault) {
  listenerMap[keycode + ''] = {
    fn: listener,
    preventDefault: preventDefault
  };
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

module.exports.setKeydownListener = function(keycode, preventDefault, listener) {
  setListener(listener, keydownMap, keycode, preventDefault);
};

module.exports.setKeyupListener = function(keycode, preventDefault, listener) {
  setListener(listener, keyupMap, keycode, preventDefault);
};

module.exports.setKeypressListener = function(keycode, preventDefault, listener) {
  setListener(listener, keypressMap, keycode, preventDefault);
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
