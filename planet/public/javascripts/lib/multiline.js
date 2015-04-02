// Return an array to iterate over. For my uses this is
// more efficient, because I only need to calculate the line text
// and positions once, instead of each iteration during animations.
module.exports.wrap = function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ')
    , line = ''
    , lines = [];

  for(var n = 0, len = words.length; n < len; n++) {
    var testLine = line + words[n] + ' '
      , metrics = ctx.measureText(testLine)
      , testWidth = metrics.width;

    if (testWidth > maxWidth) {
      lines.push({ text: line, x: x, y: y });
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  lines.push({ text: line, x: x, y: y });
  return lines;
};

module.exports.draw = function drawMultiline(context, text, linespacing, x, y, width) {
  var txt = module.exports.wrap(context, text, x, y, width, linespacing);

  for (var i = 0; i < txt.length; i++){
    var item = txt[i];
    context.fillText(item.text, item.x, item.y);
  }

  return txt[txt.length - 1].y + linespacing;
}
