var express = require('express');
var router = express.Router();
var fs = require('fs');
var config = require('../public/javascripts/config');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SNOCK PLANET' });
});

router.post('/upload-face-image', function(req, res, next) {

  function generateFilename() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    var filename = '';
    for(var i = 0; i < 5; i++) {
      filename += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return '/face-images/' + filename + '.jpg';
  }

  function stripMetadata(base64ImageData, res) {
    var metadataFooter = 'base64,';
    var stripMetadataIndex = base64ImageData.indexOf(metadataFooter);
    if (stripMetadataIndex < 0) {
      res.status(500).json({err: 'failed to decode base64 (metadata)'});
      return;
    }

    return base64ImageData.substring(stripMetadataIndex + metadataFooter.length);
  }

  var imageData = req.body.imgBase64;
  if (!imageData) {
    res.status(500).json({err: 'no imgBase64 post parameter'});
    return;
  }

  imageData = stripMetadata(imageData, res);
  var buffer = new Buffer(imageData, 'base64');

  var filename = generateFilename();
  fs.writeFile(config.static_path + filename, buffer, function(err) {
    if (err) {
      console.log(err);
      res.status(500).json({err: 'error writing file: ' + err});
      return;
    }

    res.json({imageURL: filename});
  });
});

module.exports = router;
