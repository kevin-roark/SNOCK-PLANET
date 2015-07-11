
var s3 = require('s3');
var fs = require('fs');
var mkpath = require('mkpath');

var keys = require('./keys');

var temporaryImagePath = './temp-images/';

// create the pretty s3 client
var s3Client = s3.createClient({
  s3Options: {
    accessKeyId: keys.s3_access_key,
    secretAccessKey: keys.s3_secret_key,
  }
});

module.exports.uploadFaceImage = function(imageBuffer, callback) {
  var filename = generateFilename();
  var localFilepath = temporaryImagePath + filename;

  mkpath.sync(temporaryImagePath);
  fs.writeFile(localFilepath, imageBuffer, function(err) {
    if (err) {
      callback(err);
      return;
    }

    var uploader = generateUploader(filename);

    uploader.on('error', function(err) {
      deleteFile(localFilepath);
      callback(err);
    });

    uploader.on('end', function() {
      var s3URL = generateURL(filename);
      console.log(s3URL);
      deleteFile(localFilepath);
      callback(null, s3URL);
    });
  });
};

function generateUploader(filename) {
  var localFilepath = temporaryImagePath + filename;

  var params = {
    localFile: localFilepath,

    s3Params: {
      Bucket: keys.s3_bucket_name,
      Key: filename,
      ACL: 'public-read'
    }
  };

  return s3Client.uploadFile(params);
}

function generateURL(filename) {
  return s3.getPublicUrl(keys.s3_bucket_name, filename);
}

function generateFilename() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  var filename = '';
  for(var i = 0; i < 5; i++) {
    filename += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return filename + '.jpg';
}

function deleteFile(filepath) {
  fs.unlink(filepath, function(err) {
    if (err) {
      console.log('error deleting local image file: ' + filepath);
    }
  });
}
