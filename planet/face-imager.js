
var s3 = require('s3');
var fs = require('fs');

var keys = require('./keys');
var config = require('./public/javascripts/config');

// create the pretty s3 client
var s3Client = s3.createClient({
  s3Options: {
    accessKeyId: keys.s3_access_key,
    secretAccessKey: keys.s3_secret_key,
  }
});

module.exports.uploadFaceImage = function(imageBuffer, callback) {
  var filename = generateFilename();
  var localFilepath = config.static_path + filename;

  fs.writeFile(localFilepath, imageBuffer, function(err) {
    if (err) {
      callback(err);
      return;
    }

    var uploader = generateUploader(localFilepath);

    uploader.on('error', function(err) {
      callback(err);
    });

    uploader.on('end', function() {
      var s3URL = 'asdfasdf' + filename; // TODO need to generate this shit
      callback(null, s3URL);
    });
  });
};

function generateUploader(filename) {
  var localFilepath = config.static_path + filename;

  var params = {
    localFile: localFilepath,

    s3Params: {
      Bucket: keys.s3_bucket_name,
      Key: filename
    }
  };

  var uploader = s3Client.uploadFile(params);
  return uploader;
}

function generateFilename() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  var filename = '';
  for(var i = 0; i < 5; i++) {
    filename += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return '/face-images/' + filename + '.jpg';
}
