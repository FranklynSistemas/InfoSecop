var request = require('request');
var cheerio = require('cheerio');
var cons 	=	require("consolidate");
var StringDecoder = require('string_decoder').StringDecoder;

//var mongoose = require('mongoose');

//var MongoClient = require('mongodb').MongoClient;
var express = require("express"),
	app		= express(),
	puerto	= 3000;

//Rutas	
var routes = require('./routes/rutas');
var control = require('./controladores/controller');

app.engine("html", cons.swig); //Template engine...
app.set("view engine", "html");
app.set("views", __dirname + "/vistas");
app.use(express.static('public'));

var decoder = new StringDecoder('utf8');



request('https://www.contratos.gov.co/consultas/inicioConsulta.do', function (error, response, html) {
  

  if (!error && response.statusCode == 200) {
	  
	  MuestraInicio = html;

  }


});


request('https://www.contratos.gov.co/consultas/resultadosConsulta.do', function (error, response, html) {
  
//https://www.contratos.gov.co/consultas/resultadosConsulta.do?&codi_estado=2&numeroProceso=
  if (!error && response.statusCode == 200) {
	  
	  //UltimasProcesos = html;

  }


});

//https://www.contratos.gov.co/consultas/resultadosConsulta.do?&departamento=1100&entidad=&paginaObjetivo=1&fechaInicial=&ctl00$ContentPlaceHolder1$hidIdOrgV=-1&desdeFomulario=true&registrosXPagina=200&estado=0&ctl00$ContentPlaceHolder1$hidIdEmpresaVenta=-1&ctl00$ContentPlaceHolder1$hidNombreProveedor=-1&ctl00$ContentPlaceHolder1$hidRedir=&ctl00$ContentPlaceHolder1$hidIDProducto=-1&ctl00$ContentPlaceHolder1$hidNombreDemandante=-1&cuantia=0&ctl00$ContentPlaceHolder1$hidNombreProducto=-1&ctl00$ContentPlaceHolder1$hidIdEmpresaC=0&ctl00$ContentPlaceHolder1$hidIDProductoNoIngresado=-1&ctl00$ContentPlaceHolder1$hidRangoMaximoFecha=&fechaFinal=&ctl00$ContentPlaceHolder1$hidIdOrgC=-1&objeto=27000000&tipoProceso=1&ctl00$ContentPlaceHolder1$hidIDRubro=-1&municipio=0&numeroProceso=

//https://www.contratos.gov.co/consultas/resultadosConsulta.do?&departamento=&entidad=&paginaObjetivo=1&fechaInicial=&ctl00$ContentPlaceHolder1$hidIdOrgV=-1&desdeFomulario=true&registrosXPagina=1000&estado=0&ctl00$ContentPlaceHolder1$hidIdEmpresaVenta=-1&ctl00$ContentPlaceHolder1$hidNombreProveedor=&ctl00$ContentPlaceHolder1$hidRedir=&ctl00$ContentPlaceHolder1$hidIDProducto=-1&ctl00$ContentPlaceHolder1$hidNombreDemandante=-1&cuantia=0&ctl00$ContentPlaceHolder1$hidNombreProducto=&ctl00$ContentPlaceHolder1$hidIdEmpresaC=&ctl00$ContentPlaceHolder1$hidIDProductoNoIngresado=&ctl00$ContentPlaceHolder1$hidRangoMaximoFecha=&fechaFinal=&ctl00$ContentPlaceHolder1$hidIdOrgC=&objeto=&tipoProceso=&ctl00$ContentPlaceHolder1$hidIDRubro=&municipio=&numeroProceso=
app.use('/', routes);


console.log('Escuchando por el puerto '+puerto);
app.listen(puerto);