
var express = require('express');
var router = express.Router();

var faceImager = require('../face-imager');
var config = require('../public/javascripts/config');

var ioPort = process.env.PLANET_IO_PORT || '6001';
var ioURL = process.env.PLANET_IO_URL || 'http://localhost:' + ioPort;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'NEW (SNOCK) PLANET — A place to call and be your own. Realtime chat by Kevin Roark Jr.',
    ioURL: ioURL,
    isDebug: config.isDebug
  });
});

/* POST FACE IMAGE DATA */
router.post('/upload-face-image', function(req, res, next) {

  var imageData = req.body.imgBase64;
  if (!imageData) {
    res.status(500).json({err: 'no imgBase64 post parameter'});
    return;
  }

  var strippedImageData = stripImageMetadata(imageData, res);
  var buffer = new Buffer(strippedImageData, 'base64');

  faceImager.uploadFaceImage(buffer, function(err, filepath) {
    if (err) {
      console.log('error uploading face: ');
      console.log(err);
      res.status(500).json({err: 'error writing file: ' + err});
      return;
    }

    res.json({imageURL: filepath});
  });

});

function stripImageMetadata(base64ImageData, res) {
  var metadataFooter = 'base64,';
  var stripMetadataIndex = base64ImageData.indexOf(metadataFooter);
  if (stripMetadataIndex < 0) {
    res.status(500).json({err: 'failed to decode base64 (metadata)'});
    return;
  }

  return base64ImageData.substring(stripMetadataIndex + metadataFooter.length);
}

module.exports = router;
