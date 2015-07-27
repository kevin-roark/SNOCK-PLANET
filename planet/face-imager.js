
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
      deleteFile(localFilepath);
      callback(null, s3URL);
    });
  });
};

module.exports.deleteURLs = function(urls) {
  if (!urls || urls.length === 0) {
    return;
  }

  var objectsToDelete = [];
  urls.forEach(function(url) {
    var key = keyFromURL(url);
    objectsToDelete.push({Key: key});
  });

  var params = {
    Bucket: keys.s3_bucket_name,

    Delete: {
      Objects: objectsToDelete
    }
  };

  s3Client.deleteObjects(params, function(err) {
    if (err) {
      console.log('error deleting objects:');
      console.log(err);
    }
  });
};

function keyFromURL(url) {
  // example url: https://s3.amazonaws.com/snock-planet/qnmES.jpg
  var components = url.split('/');
  var lastComponent = components[components.length - 1];
  return lastComponent;
}

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
  for(var i = 0; i < 12; i++) {
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
