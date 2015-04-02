
var SheenModel = require('./sheen-model');
var config = require('./config');
var multiline = require('./lib/multiline');

module.exports = Note;

var Super = SheenModel.prototype;
Note.prototype = Object.create(Super);

function Note(options) {
  SheenModel.call(this, options);

  if (this.initialPosition.y == 0) {
    this.initialPosition.y = (Math.random() + 0.05) * 16 + 5;
  }
}

Note.prototype.updateFromModel = function(noteData) {
  Super.updateFromModel.call(this, noteData);

  this.text = noteData.text || '';
  this.when = noteData.when || new Date();
  this.depth = noteData.depth || (Math.random() + 0.05) * 25;
  this.accentTexture = noteData.accentTexture || config.note_textures.paper;
  this.door = noteData.door || null;
  this.creator = noteData.creator || null;
};

Note.prototype.serialize = function() {
  var data = Super.serialize.call(this);

  data.text = this.text;
  data.when = this.when;
  data.accentTexture = this.accentTexture;
  data.door = this.door;
  data.creator = this.creator;

  return data;
};

Note.prototype.loadMesh = function(callback) {
  this.canvas = makeTextCanvas({
    text: this.text
  });

  this.texture = new THREE.Texture(this.canvas);
  this.texture.needsUpdate = true;

  // this.material === material wit tha words on it
  this.material = new THREE.MeshBasicMaterial({
    map: this.texture
  });

  var accentTexture = new THREE.ImageUtils.loadTexture(this.accentTexture);
  accentTexture.wrapS = THREE.RepeatWrapping;
  accentTexture.wrapT = THREE.RepeatWrapping;

  this.accentMaterial = new THREE.MeshBasicMaterial({
    map: accentTexture
  });

  var materials = [
    this.accentMaterial, this.accentMaterial.clone(), this.accentMaterial.clone(), this.accentMaterial.clone(),
    this.material, this.material.clone()
  ];

  this.meshFaceMaterial = new THREE.MeshFaceMaterial(materials);

  var scalar = 0.025;
  this.width = this.canvas.width * this.scale * scalar;
  this.height = this.canvas.height * this.scale * scalar;
  this.geometry = new THREE.BoxGeometry(this.width, this.height, this.depth * this.scale);

  this.mesh = new THREE.Mesh(this.geometry, this.meshFaceMaterial);
  this.mesh.doubleSided = true;

  this.meshes = [this.mesh];

  if (callback) callback();
};

function makeTextCanvas(options) {
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
  canvas.width = Math.max(minWidth, Math.min(maxWidth, textWidth) + horPadding * 2);

  // split the text into multiple lines
  context.font = font;
  var wrappedText = multiline.wrap(context, text, horPadding, verPadding, canvas.width, fontSize + 10);

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
}

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
