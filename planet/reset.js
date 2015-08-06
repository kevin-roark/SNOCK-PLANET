#!/usr/bin/env node

var models = require('./models');
var Avatar = models.Avatar;
var Door = models.Door;
var Note = models.Note;
var faceImager = require('./face-imager');
var mkpath = require('mkpath');
var fs = require('fs');

console.log('cleaning you up ...');

deleteDoors(function(allDoors) {
  deleteNotes(function(allNotes) {
    deleteAvatars(function(allAvatars) {
      makeLog(allDoors, allNotes, allAvatars, function() {
        sayGoodnight();
      });
    });
  });
});

function sayGoodnight() {
  console.log('terminating ... bye!');
  process.exit(1);
}

function makeLog(doors, notes, avatars, callback) {
  console.log('making the log...');

  var avatarMap = {};
  avatars.forEach(function(avatar) {
    avatarMap[avatar._id] = avatar;
  });

  var doorMap = {};
  var doorToNotesMap = {};
  doors.forEach(function(door) {
    doorMap[door._id] = door;
    doorToNotesMap[door._id] = [];
  });

  notes.forEach(function(note) {
    doorToNotesMap[note.door].push(note);
  });

  var log = '';
  Object.keys(doorToNotesMap).forEach(function(doorID) {
    var door = doorMap[doorID];
    var notesInDoor = doorToNotesMap[doorID];
    var doorCreator = avatarMap[door.creator];

    var doorLog = 'Door Titled "' + door.subject + '"';
    if (doorCreator) {
      doorLog += ' (created by "' + doorCreator.name + '")';
    }
    doorLog += ':\n';

    notesInDoor.forEach(function(note, index) {
      var creator = avatarMap[note.creator];
      var noteLog = (index+1) + '. "' + note.text + '" at ' + dateString(note.when) + ' by "' + creator.name + '"\n';
      doorLog += noteLog;
    });

    log += doorLog + '\n';
  });

  var logFolder = './planet_logs';
  var filepath = logFolder + '/' + filename();
  console.log('writing log to ' + filepath);
  mkpath.sync(logFolder);
  fs.writeFile(filepath, log, function(err) {
    if (err) {
      console.log('error writing file:');
      console.log(err);
    }
    else {
      console.log('wrote log file!');
    }

    if (callback) callback();
  });

  function dateString(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    return month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
  }

  function filename() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    return month + '-' + day + '-' + year + '.txt';
  }
}

function deleteAvatars(callback) {
  Avatar.find({}, function(err, avatars) {
    if (err) {
      console.log(err);
      if (callback) callback([]);
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

    if (callback) callback(avatars);
  });
}

function deleteDoors(callback) {
  Door.find({}, function(err, doors) {
    if (err) {
      console.log(err);
      if (callback) callback([]);
      return;
    }

    deleteModels(doors);
    console.log('doors are deleted');

    if (callback) callback(doors);
  });
}

function deleteNotes(callback) {
  Note.find({}, function(err, notes) {
    if (err) {
      console.log(err);
      if (callback) callback([]);
      return;
    }

    deleteModels(notes);
    console.log('notes are deleted');

    if (callback) callback(notes);
  });
}

function deleteModels(models) {
  models.forEach(function(model) {
    model.remove();
  });
}
