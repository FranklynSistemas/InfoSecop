var mongoose = require('mongoose');

var   Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

var usuariosSchema = new Schema({
   id_Obj:ObjectId,
   id: Number,
   Nombres: String,
   Apellidos: String,
   Telefono: String,
   Correo: String,
   Departamento: Number,
   Actividad : Number,
   Fecha : String
});

module.exports = mongoose.model('usuarios', usuariosSchema);