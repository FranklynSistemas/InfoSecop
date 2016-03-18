var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get("/inicio", function(req, res){
		res.send(MuestraHtml);
});

router.get("/consultas", function(req, res){
		res.send(MuestraInicio);
});

router.get("/Procesos", function(req, res){
		res.send(UltimasProcesos);
});


router.get("*", function(req, res){
	
	res.status(404).send("Página no encontrada :( en el momento");

});

module.exports = router;