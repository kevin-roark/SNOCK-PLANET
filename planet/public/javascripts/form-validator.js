
var avatarValidChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
var doorValidChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_ ';

module.exports.isValidName = function(name, options) {
  if (!options) options = {};

  var minLength = options.minLength || 1;
  var maxLength = options.maxLength || 15;

  return isValidString(name, avatarValidChars, minLength, maxLength);
};

module.exports.isValidDoorSubject = function(subject, options) {
  if (!options) options = {};

  var minLength = options.minLength || 1;
  var maxLength = options.maxLength || 39;

  return isValidString(subject, doorValidChars, minLength, maxLength);
};

var isValidString = function(string, validChars, minLength, maxLength) {
  if (!string || string.length < minLength || string.length > maxLength) {
    return false;
  }

  for (var i = 0; i < string.length; i++) {
    var iChar = string.charAt(i);
    if (!isValidChar(validChars, iChar)) {
      return false;
    }
  }

  return true;
};

var isValidChar = function(validChars, char) {
  var idx = validChars.indexOf(char);
  return idx >= 0;
};
