
var models = require('./models');
var Avatar = models.Avatar;
var Door = models.Door;
var Note = models.Note;

logModel(Avatar);
logModel(Door);
logModel(Note);

function logModel(Model) {
  Model.find({}, function(err, models) {
    if (err) {
      console.log(err);
      return;
    }

    models.forEach(function(model) {
      console.log(model);
    });
  });
}
