
var validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';

module.exports.isValidName = function(name, options) {
  if (!options) options = {};

  var minLength = options.minLength || 1;
  var maxLength = options.maxLength || 15;

  if (!name || name.length < minLength || name.length > maxLength) {
    return false;
  }

  for (var i = 0; i < name.length; i++) {
    var iChar = name.charAt(i);
    if (!isValidChar(iChar)) {
      return false;
    }
  }

  return true;
};

var isValidChar = module.exports.isValidChar = function(char) {
  var idx = validChars.indexOf(char);
  return idx >= 0;
};
