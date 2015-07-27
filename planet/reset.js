
var models = require('./models');
var Avatar = models.Avatar;
var Door = models.Door;
var Note = models.Note;
var faceImager = require('./face-imager');

deleteNotes();
deleteDoors();
deleteAvatars();

function deleteAvatars() {
  Avatar.find({}, function(err, avatars) {
    if (err) {
      console.log(err);
      return;
    }

    var faceImageURLs = [];
    avatars.forEach(function(avatar) {
      var faceURL = avatar.faceImageUrl;
      if (faceURL) {
        faceImageURLs.push(faceURL);
      }

      avatar.remove();
    });
    console.log('avatars are deleted');

    faceImager.deleteURLs(faceImageURLs);
    console.log('s3 is clean');
  });
}

function deleteDoors() {
  Door.find({}, function(err, doors) {
    if (err) {
      console.log(err);
      return;
    }

    deleteModels(doors);
    console.log('doors are deleted');
  });
}

function deleteNotes() {
  Note.find({}, function(err, notes) {
    if (err) {
      console.log(err);
      return;
    }

    deleteModels(notes);
    console.log('notes are deleted');
  });
}

function deleteModels(models) {
  models.forEach(function(model) {
    model.remove();
  });
}
