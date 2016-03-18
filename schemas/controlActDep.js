var mongoose = require('mongoose');
//var bcrypt = require('bcrypt-nodejs');

//mongoose.connect('mongodb://localhost/infosecop');

var   Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

var numeroregActDepSchema = new Schema({
   id_Obj:ObjectId,
   id: String,
   Actividad: String,
   Departamento:String,
   numRegistros: String,
   feha: String
});

module.exports = mongoose.model('numeroregActDep', numeroregActDepSchema);