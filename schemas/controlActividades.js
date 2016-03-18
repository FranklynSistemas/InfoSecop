var mongoose = require('mongoose');
//var bcrypt = require('bcrypt-nodejs');

//mongoose.connect('mongodb://localhost/infosecop');

var   Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

var numeroregActSchema = new Schema({
   id_Obj:ObjectId,
   id: String,
   Actividad: String,
   numRegistros: String,
   feha: String
});

module.exports = mongoose.model('numeroregAct', numeroregActSchema);