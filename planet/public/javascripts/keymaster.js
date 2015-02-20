
var $ = require('jquery');

var keydownMap = {};
var keyupMap = {};
var keypressMap = {};

$('body').keydown(function(ev) {
  callListeners(keydownMap, ev.which);
});

$('body').keyup(function(ev) {
  callListeners(keyupMap, ev.which);
});

$('body').keypress(function(ev) {
  console.log('key press eh? ' + ev.which);
  callListeners(keypressMap, ev.which);
});

function callListeners(listenerMap, ev) {
  var listeners = getListeners(listenerMap, ev.which);
  if (listeners) {
    for (var i = 0; i < listeners.length; i++) {
      listeners[i](ev);
    }
  }
}

function getListeners(listenerMap, keycode) {
  var key = keycode + '';
  return listenerMap[key];
}

function addListener(listener, listenerMap, keycode) {
  var listeners = getListeners(listenerMap, keycode);
  if (!listeners) {
    listeners = [];
  }
  listeners.push(listener);
}

function clearListeners(listenerMap, keycode) {
  if (keycode) {
    listenerMap[keycode + ''] = [];
  } else {
    for (var key in listenerMap) {
      listenerMap[key] = [];
    }
  }
}

/* exports */

module.exports.addKeydownListener = function(keycode, listener) {
  addListener(listener, keydownMap, keycode);
};

module.exports.addKeyupListener = function(keycode, listener) {
  addListener(listener, keyupMap, keycode);
};

module.exports.addKeypressListener = function(keycode, listener) {
  addListener(listener, keypressMap, keycode);
};

module.exports.clearKeydownListeners = function(keycode) {
  clearListeners(keydownMap, keycode);
};

module.exports.clearKeyupListeners = function(keycode) {
  clearListeners(keyupMap, keycode);
};

module.exports.clearKeypressListeners = function(keycode) {
  clearListeners(keypressMap, keycode);
};
