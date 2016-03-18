var mongoose = require('mongoose');

var   Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

var actividadesSchema = new Schema({
   id_Obj:ObjectId,
   Actividad : String,
   Valor : String
});

module.exports = mongoose.model('actividades', actividadesSchema);