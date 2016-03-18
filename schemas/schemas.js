var mongoose = require('mongoose');
//var bcrypt = require('bcrypt-nodejs');

var   Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

var datosSchema = new Schema({
   id_Obj:ObjectId,
   id : String, 
   numProceso:String,
   tipoProceso: String,
   Estado: String,
   Entidad: String,
   Objeto: String,
   DepMun: String,
   Cuantia: String,
   Fecha: String,
   URL: String
});

module.exports = mongoose.model('datos', datosSchema);