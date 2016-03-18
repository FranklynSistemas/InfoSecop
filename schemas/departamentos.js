var mongoose = require('mongoose');

var   Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

var departamentosSchema = new Schema({
   id_Obj:ObjectId,
   Departamento : String,
   Valor : String
});

module.exports = mongoose.model('departamentos', departamentosSchema);