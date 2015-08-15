
var multiline = require('./lib/multiline');

module.exports = function makeTextCanvas(options) {
  var text = options.text || '';

  var fontSize = options.fontSize || 24;
  var fontName = options.fontName || 'Georgia';
  var font = fontSize + 'pt "' + fontName + '"';

  var backgroundColor = options.backgroundColor || 'rgb(245, 245, 245)';
  var textColor = options.textColor || 'black';

  var minWidth = options.minWidth || 100;
  var maxWidth = options.maxWidth || 300;
  var horPadding = options.horPadding || 20;
  var verPadding = options.verPadding || 20;

  var imageHeight = options.imageHeight || 150;

  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");

  if (options.mediaURL) {
    loadImage(options.mediaURL, function(img) {
      var mediaWidth = img.width / img.height * imageHeight;
      var mediaX = Math.max(horPadding, canvas.width / 2 - mediaWidth / 2);
      var mediaY = canvas.height - imageHeight - verPadding;

      context.drawImage(img, mediaX, mediaY, mediaWidth, imageHeight);
    });
  }

  // measure the width of the text in one line
  context.font = font;
  var textWidth = context.measureText(text).width;

  // set canvas width within prescribed range
  canvas.width = Math.max(minWidth, Math.min(maxWidth, textWidth)) + horPadding * 2;

  // split the text into multiple lines
  context.font = font;
  var wrappedText = multiline.wrap(context, text, horPadding, verPadding, canvas.width - horPadding * 1.5, fontSize + 10);

  // base height on number of lines
  canvas.height = Math.max(wrappedText[wrappedText.length - 1].y + fontSize + verPadding + 5, fontSize + verPadding);
  if (options.mediaURL) {
    canvas.height += imageHeight;
  }

  // background color
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // text details
  context.font = font;
  context.fillStyle = textColor;
  context.textBaseline = 'top';

  // draw the text right in there
  for (var i = 0; i < wrappedText.length; i++){
    var item = wrappedText[i];
    context.fillText(item.text, item.x, item.y);
  }

  return canvas;
};

function loadImage(path, callback) {
  if (!callback) return;

  if (!path) {
    callback();
    return;
  }

  var img = new Image();

  img.onload = function() {
      callback(img);
  };

  img.src = path;
}
