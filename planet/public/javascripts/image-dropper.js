
var $ = require('jquery');

var options = module.exports.options = {
  dragAreaSelector: '#avatar-image-drop-zone',
  previewAreaSelector: null,
  dragoverClassname: 'hover',
  dragoverText: "THAT'S RIGHT",
  maxFiles: 1,
  resizeWidth: 128,
  resizeHeight: 128,
  imagePostURL: null
};

module.exports.progressCallback = function(percent) {};
module.exports.previewCallback = function(renderedCanvas) {};
module.exports.fileCallback = function(files) {};

var tests = {
  filereader: typeof FileReader !== 'undefined',
  dnd: 'draggable' in document.createElement('span'),
  formdata: !!window.FormData,
  progress: "upload" in new XMLHttpRequest()
};

var acceptedTypes = {
  'image/png': true,
  'image/jpeg': true,
  'image/gif': true
};

var dragArea, $fileSelect;

module.exports.init = function() {
  dragArea = document.querySelector(options.dragAreaSelector);
  options.previousText = dragArea.innerHTML || '';

  if (dragArea) {
    $fileSelect = $('<input></input>');
    $fileSelect.attr('type', 'file');
    $fileSelect.attr('accept', 'image/*');
    $fileSelect.css('display', 'none');
    $('body').append($fileSelect);
  }

  if (tests.dnd) {
    dragArea.ondragover = function (e) {
      e.preventDefault();

      this.className = options.dragoverClassname;
      if (options.dragoverText) {
        $(dragArea).text(options.dragoverText);
      }

      return false;
    };
    dragArea.ondragleave = function (e) {
      e.preventDefault();

      this.className = '';
      if (options.previousText) {
        $(dragArea).text(options.previousText);
      }

      return false;
    };
    dragArea.ondrop = function (e) {
      e.preventDefault();

      this.className = '';
      if (options.previousText) {
        $(dragArea).text(options.previousText);
      }

      readfiles(e.dataTransfer.files);
    };
  }

  if ($fileSelect) {
    dragArea.onclick = function(e) {
      $fileSelect.click();
      e.preventDefault();
    };

    $fileSelect.change(function() {
      var files = $fileSelect.get(0).files;
      if (files) {
        readfiles(files);
      }
    });
  }
};

function previewfile(file) {
  if (tests.filereader && acceptedTypes[file.type]) {
    var reader = new FileReader();
    reader.onload = function (event) {
      var image = new Image();

      image.onload = function() {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = options.resizeWidth;

        // set height proportional to width as fallback
        canvas.height = options.resizeHeight || canvas.width * (image.height / image.width);

        // step 1 - resize to 50%
        var oc = document.createElement('canvas');
        var octx = oc.getContext('2d');
        oc.width = image.width * 0.5;
        oc.height = image.height * 0.5;
        octx.drawImage(image, 0, 0, oc.width, oc.height);

        // step 2 - resize 50% of step 1
        octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

        // step 3, resize to final size
        ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5, 0, 0, canvas.width, canvas.height);

        if (options.previewAreaSelector) {
          $(options.previewAreaSelector).html('');
          $(options.previewAreaSelector).append(canvas);
        }

        module.exports.previewCallback(canvas);
      };

      image.src = event.target.result;
    };

    reader.readAsDataURL(file);
  }
}

function readfiles(files) {
  var lastIndex = Math.min(files.length, options.maxFiles);
  var trimmedFiles = [];
  for (var i = 0; i < lastIndex; i++) {
    trimmedFiles.push(files[i]);
  }

  var formData = tests.formdata ? new FormData() : null;
  for (var i = 0; i < trimmedFiles.length; i++) {
    var f = trimmedFiles[i];
    if (tests.formdata) {
      formData.append('file', f);
    }
    previewfile(f);
  }

  if (tests.formdata && options.imagePostURL) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', options.imagePostURL);
    xhr.onload = function() {
      module.exports.progressCallback(100);
    };

    if (tests.progress) {
      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          var complete = (event.loaded / event.total * 100 | 0);
          module.exports.progressCallback(complete);
        }
      };
    }

    xhr.send(formData);
  }

  module.exports.fileCallback(trimmedFiles);
}
