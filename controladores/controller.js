var request = require('request');
var cheerio = require('cheerio');
var StringDecoder = require('string_decoder').StringDecoder;
var sendgrid = require('sendgrid')('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');

//---------------------------------------------------------------Mail---------------------------------------

function envioCorreos(datos){
var correos = ['franking.sistemas@gmail.com','flm@galavi.co', 'amvs@galavi.co'];
sendgrid.send({
  to:       correos,
  from:     'franklyn.sis@hotmail.com',
  subject:  'Control Numero de registos Secop',
  text:      datos
}, function(err, json) {
  if (err) { return console.error(err); }
  console.log(json);
});

}

//------------------------------------------------------------------------------------------------------------

//Tablas BD
var conexion = require('../schemas/ConexionBD');
var Departamentos = require('../schemas/departamentos');
var Actividades = require('../schemas/actividades');
var Registros = require('../schemas/schemas');
var NumRegistros = require('../schemas/control');
var NumRegistrosDep = require('../schemas/controlDepartamentos');
var NumRegistrosAct = require('../schemas/controlActividades');
var NumRegistrosActDep = require('../schemas/controlActDep');

var BDResgistros = [NumRegistros,NumRegistrosDep,NumRegistrosAct,NumRegistrosActDep];
var decoder = new StringDecoder('utf8');

//Parametros de consulta
var fechaConsulta = '01/01/2016';
var valorConsulta = 1001;
var valorDepartamento=([]);
var valorActividades=([]);

//Trae todos los departamentos desde la bd
function TraeDepartamentos(){
	Departamentos.find({},function(err,data){
		if(data){
			CargaVariable(1,data);
		}
	});
}TraeDepartamentos();

//Trae todos los departamentos desde la bd
function TraeActividades(){
	Actividades.find({},function(err,data){
		
		if(data){
			CargaVariable(2,data);
		}
	});
}TraeActividades();

function CargaVariable(tipo,info){
	
	switch(tipo){
		case 1: 
			valorDepartamento = info;
		break;
		case 2:
			valorActividades = info;
		break;
	}
}

var idDep = 0;
var idActividad =0;
var numCallRevisaDepartamentos = 0;
var numCallRevisaActividades = 0;
var numCallRevisaDepAct = 0;
var numDepartamento=1;

//var target = `https://www.contratos.gov.co/consultas/resultadosConsulta.do?&departamento=${valorDepartamento[idDep]}&entidad=&paginaObjetivo=&fechaInicial=${fechaConsulta}&ctl00$ContentPlaceHolder1$hidIdOrgV=-1&desdeFomulario=true&registrosXPagina=${valorConsulta}&estado=2&ctl00$ContentPlaceHolder1$hidIdEmpresaVenta=-1&ctl00$ContentPlaceHolder1$hidNombreProveedor=-1&ctl00$ContentPlaceHolder1$hidRedir=&ctl00$ContentPlaceHolder1$hidIDProducto=-1&ctl00$ContentPlaceHolder1$hidNombreDemandante=-1&cuantia=0&ctl00$ContentPlaceHolder1$hidNombreProducto=-1&ctl00$ContentPlaceHolder1$hidIdEmpresaC=0&ctl00$ContentPlaceHolder1$hidIDProductoNoIngresado=-1&ctl00$ContentPlaceHolder1$hidRangoMaximoFecha=&fechaFinal=&ctl00$ContentPlaceHolder1$hidIdOrgC=-1&objeto=&tipoProceso=&ctl00$ContentPlaceHolder1$hidIDRubro=-1&municipio=0&numeroProceso=`
MuestraHtml='No funciono';
MuestraInicio = '';
UltimasProcesos = '';
var url=([]);
var a='';
var numReg=0;
var database =([]);
var datos = ([]);
var diferencia=0;


//Trae los datos segun parametros de consulta
function TraeDatos(Fecha,Valor,idDep,Actividad){


request(GeneraTarget(Fecha,Valor,idDep,Actividad), function (error, response, html) {
  

  if (!error && response.statusCode == 200) {
		
	$ = cheerio.load(html);
	 //Contenido de la pagina dentro de un array 
	 var Content = $('tr').toArray();

	  MuestraHtml = html;

	 	//Agregar los links de forma correcta
	 	
		$('td').each(function(i,element){
			a = $(this).children();
			if(a.attr('href') != undefined){
				url.push('https://www.contratos.gov.co'+a.attr('href').substring(24,a.attr('href').length-2)); 
			}
			
		});
		
		
		
		for(var i=0; i<Content.length; i++){
			
			$(Content[i]).each(function(j, element){
				var td = $(this).children();
				//console.log(td.length);

					
					id = $(td[0]).text();
					NumeroProceso = $(td[1]).text().trim();
					tipoProceso = $(td[2]).text();
					Estado = decoder.write($(td[3]).text());
					Entidad = decoder.write($(td[4]).text());
					Objeto = decoder.write($(td[5]).text());
					DepMun = decoder.write($(td[6]).text());
					Cuantia = $(td[7]).text();
					Fecha = $(td[8]).text();
					Url=url[i-1];
				
				info = {id : id, 
						numProceso:NumeroProceso,
						tipoProceso: tipoProceso,
						Estado: Estado,
						Entidad: Entidad,
						Objeto: Objeto,
						DepMun: DepMun,
						Cuantia: Cuantia,
						Fecha: Fecha,
						URL: Url
						};
				
			});
			database.push(info);
			GuardarDatos(info);
		}
		
		//console.log(database);
		MuestraHtml = database;
		

	  //Contar las tr de una tabla
	  var rows = $("table").find("tr");
	  console.log(rows.length);

  }

});

}

function GuardarDatos (Database) {
	

	//console.log(datos)
	 
	  Registros.findOne({numProceso: Database.numProceso},function (err, ok) {
      if (err){
         console.log("Error general");
      }else if(!ok){
      		datos =  new Registros(Database);
      		datos.save(function (err, obj) {
               if (!err) 

                  console.log(obj.numProceso + ' ha sido guardado');
                  //res.json({status : true});
                  //res.render('Administracion/Usuarios',{Nombre: req.session.VariableSession.Nombres});
               });
  		
      }else{
         console.log("El dato ya existe");
      }
   });

}

// Valida numero de Registros en BD y en Secop----------------------------------------------------------
function validaNewRegistros(tipo,Departamento, Actividad ,callback){
	var newTraget = '';
	var idBD = 0;
	var datos ={};


	if(Departamento < 0 && Actividad < 0 && tipo == 0){
		newTraget = GeneraTarget(fechaConsulta,1,0,0);
		idBD = 0;
	}else if(Departamento > 0 && Actividad > 0 && tipo === 1){
		newTraget = GeneraTarget(fechaConsulta,1,Departamento,Actividad);
		idBD = 3;
	}else if(Departamento > 0 && Actividad < 0 && tipo === 2){
		newTraget = GeneraTarget(fechaConsulta,1,Departamento,0);
		idBD = 1;
	}else if(Departamento < 0 && Actividad > 0 && tipo === 3){
		newTraget = GeneraTarget(fechaConsulta,1,0,Actividad);
		idBD = 2;
	}

	request(newTraget, function (error, response, html) {
  	
  		if (!error && response.statusCode == 200) {
			
			$ = cheerio.load(html);

			var input = $('input');
	  		numReg = $(input[12]).val();
	  		console.log(numReg);
	  		switch(idBD){
	  			case 0:
	  				datos = {
	  							numRegistros: numReg,
   								feha: GeneraFechaHora()
	  				   		};
	  			break;
	  			case 1:
	  				datos = {
   								Departamento:valorDepartamento[Departamento].Valor,
   								numRegistros: numReg === undefined ? 0: numReg,
   								feha: GeneraFechaHora()
	  				   		};
	  			break;
	  			case 2:
	  				datos = {
   								Actividad:valorActividades[Actividad].Valor,
   								numRegistros: numReg === undefined ? 0: numReg,
   								feha: GeneraFechaHora()
	  				   		};
	  			break;
	  			case 3:
	  				datos = {
	  							Departamento:valorDepartamento[Departamento].Valor,
   								Actividad:valorActividades[Actividad].Valor,
   								numRegistros: numReg === undefined ? 0: numReg,
   								feha: GeneraFechaHora()
	  				   		};
	  			break;

	  		}
	  		 
	         
	  		GuardaNumeroRegistros(Departamento,Actividad,idBD,datos,numReg, function(dato,cont,elQuery){
	  			console.log('Dentro de Valida: '+dato+' '+cont);
	  			if(elQuery<0){
	  				var dataAux = datos;
      				dataAux.id = cont+1;	
      				numeroRegistros =  new BDResgistros[idBD](dataAux);
      				numeroRegistros.save(function (err, obj){
               		if (!err){
               			
               			callback(dato);
               			
               	  		
               		}else{
               			callback(0);
               		}
               		
               	});

	  			}else if(dato > 0){
	  				BDResgistros[idBD].update(elQuery,datos,{upsert:true},function(err,numAffected){
	  					console.log(numAffected);
	  					if(numAffected){
	  						callback(dato);
	  					}else{
	  						callback(0);
	  					}
	  				});


	  			}else{
	  				callback(0);
	  			}

	  		});

		}
		
	});
}

//--------------------------------------------------------------------------------------------------------------

//Gurda la cantidad de registros segun corresponda en BD--------------------------------------------------------
function GuardaNumeroRegistros(idD,idA,bd,datos,numReg,callback){
	var dato = 0;
	var query = {};
	var queryNumReg ={};
	switch(bd){
		case 0:
			query = {numRegistros: numReg};
			queryNumReg ={};
			console.log(query);
		break;
		case 1:
			query = {Departamento: valorDepartamento[idD].Valor,
					 numRegistros: numReg};
			queryNumReg ={Departamento: valorDepartamento[idD].Valor};
			console.log(query);
		break;
		case 2:
			query = {Actividad: valorActividades[idA].Valor,
					 numRegistros: numReg};
			queryNumReg ={Actividad: valorActividades[idA].Valor};
			console.log(query);
		break;
		case 3:
			query = {Departamento: valorDepartamento[idD].Valor,
					 Actividad: valorActividades[idA].Valor,
					 numRegistros: numReg};
			queryNumReg ={	Departamento: valorDepartamento[idD].Valor,
							Actividad: valorActividades[idA].Valor};
			console.log(query);
		break;

	}
	BDResgistros[bd].findOne(query,function (err, result) {
      if (err){
      	 callback(dato,0);
         console.log("Error general");
      }else if(!result)
      {
      	BDResgistros[bd].count(function(err,cont)
      	{	
      		console.log('Query Numero Registro: ');
      		console.log(queryNumReg);
	      	BDResgistros[bd].find(queryNumReg,function(err,respuesta)
	      		{
	      		
	      		if(respuesta.length > 0 ){
	      				console.log(respuesta[0].numRegistros+' != '+numReg);
	      			if(respuesta[0].numRegistros != numReg){

	      				var diferencia = numReg-respuesta[0].numRegistros;
	      				callback(diferencia,cont,queryNumReg);
						/*
	      				CalculaDiferencia(GeneraQuery(query,respuesta[0].numRegistros),bd,numReg,function(result){
	      					console.log('Dentro de Guardar '+result+' '+respuesta.numRegistros);
	      					callback(result,cont,queryNumReg);
     			
	      			
	      				});
	      				*/	 
	      			}else{
	      				callback(0);
	      			}		
	      				
	      			}else{
	      			console.log('llego aqui');
	      			callback(numReg,cont,-1);
	      			}    		
	      		
	      		
	      		});
		});
      }else{
      		callback(dato,0);
      }  
 	
  });
 
}
//--------------------------------------------------------------------------------------------------------

//Genera el Query que servira para realizar el calculo la diferencia en los numeros de registro
function GeneraQuery(queryAux,registosEnBd){
	return queryAux.numRegistros = registosEnBd;
}
//-------------------------------------------------------------------------------------------------------


//Calcula la diferencia que exista entre el numero de resgistros de Secop y la base de datos
var CalculaDiferencia = function (query,bd,numReg,callback){
					BDResgistros[bd].findOne(query,function(err,rest) {

      				var result =  rest ?  parseInt(numReg) - parseInt(rest.numRegistros): 0;
    				console.log('Dentro de Calcula: '+result+'--------'+numReg+'-'+rest.numRegistros);
    				console.log(query);
    				callback(result);
      			});

}
//--------------------------------------------------------------------------------------------------------


// Crea las consultas dinamicamente

function DinamicTarger(categoria,DatosCosulta,Actividad){

	switch(categoria){
		case 0:
			for (var i = 0; i < valorDepartamento.length; i++) {
					GeneraTarget(fechaConsulta,DatosCosulta,i,Actividad);
				};
		break;

	}
	

}

// Genera la URL segun los parametros de Fecha, numero de registros, Departamento  y Actividad Economica
function GeneraTarget(fecha,valor,idDepartamento,idActividad){
	console.log(" Departamento: "+valorDepartamento[idDepartamento].Valor+" Actividad: "+valorActividades[idActividad].Valor);
	return `https://www.contratos.gov.co/consultas/resultadosConsulta.do?&departamento=${valorDepartamento[idDepartamento].Valor}&entidad=&paginaObjetivo=&fechaInicial=${fecha}&ctl00$ContentPlaceHolder1$hidIdOrgV=-1&desdeFomulario=true&registrosXPagina=${valor}&estado=2&ctl00$ContentPlaceHolder1$hidIdEmpresaVenta=-1&ctl00$ContentPlaceHolder1$hidNombreProveedor=-1&ctl00$ContentPlaceHolder1$hidRedir=&ctl00$ContentPlaceHolder1$hidIDProducto=-1&ctl00$ContentPlaceHolder1$hidNombreDemandante=-1&cuantia=0&ctl00$ContentPlaceHolder1$hidNombreProducto=-1&ctl00$ContentPlaceHolder1$hidIdEmpresaC=0&ctl00$ContentPlaceHolder1$hidIDProductoNoIngresado=-1&ctl00$ContentPlaceHolder1$hidRangoMaximoFecha=&fechaFinal=&ctl00$ContentPlaceHolder1$hidIdOrgC=-1&objeto=${valorActividades[idActividad].Valor}&tipoProceso=&ctl00$ContentPlaceHolder1$hidIDRubro=-1&municipio=0&numeroProceso=`

}

//Genera la fecha y la hora del dia
function GeneraFechaHora(){
	var month = new Array();
    month[0] = "Enero";
    month[1] = "Febrero";
    month[2] = "Marzo";
    month[3] = "Abril";
    month[4] = "Mayo";
    month[5] = "Junio";
    month[6] = "Julio";
    month[7] = "Agosto";
    month[8] = "Septiembre";
    month[9] = "Octubre";
    month[10] = "Noviembre";
    month[11] = "Diciembre";

	var d = new Date();
    return   'Hoy: '+d.getDate()+' de '+month[d.getMonth()]+' de '+d.getFullYear()+' a las '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
}
//---------------------------------------------------------------------------------------------------------

//Ejecuta la validacion del numero de registros en todos los departamentos
function RevisaDepartamentos(){
	console.log('Revisa Departamentos');
	numCallRevisaDepartamentos++;

	validaNewRegistros(2,numCallRevisaDepartamentos,-1,function(dato){
   					if(dato != 0 && dato != undefined){
    				var Informacion = `Se han agregado: ${dato} Nuevos Registros en el departamento de ${valorDepartamento[numCallRevisaDepartamentos].Departamento} -- ${GeneraFechaHora()}`;
					//UltimasProcesos = `hora -- Los procesos de hoy son: ${numReg}`
   					//envioCorreos(Informacion);
   					}
   	});

	if(numCallRevisaDepartamentos<valorDepartamento.length-1){
   			setTimeout(function(){
   				RevisaDepartamentos();
   			},2500);	
   	}else{
   		RevisaActividadesDepartamentos();
   	}
   				

}
//------------------------------------------------------------------------------------------------------------

//Ejecuta la validacion del numero de registros en todos las Actividades
function RevisaActividades(){
	console.log('Revisa Actividades');
	numCallRevisaActividades++;

   				validaNewRegistros(3,-1,numCallRevisaActividades,function(dato){
   					if(dato != 0 && dato != undefined){
    				var Informacion = `Se han agregado: ${dato} Nuevos Registros para la actividad ${valorActividades[numCallRevisaActividades].Actividad} -- ${GeneraFechaHora()}`;
					//UltimasProcesos = `hora -- Los procesos de hoy son: ${numReg}`
   					//envioCorreos(Informacion);
   					}
   				});

   			if(numCallRevisaActividades<valorDepartamento.length){
   			setTimeout(function(){
   				RevisaActividades();
   			},2000);

   			}else{
   				RevisaDepartamentos();
   			}
   			
}


//Ejecuta la validacion del numero de registros en todos las Actividades y Departamentos 

function RevisaActividadesDepartamentos(){
	console.log('Revisa Actividades y Departamentos');

	numCallRevisaDepAct++; 			
   	
   			validaNewRegistros(1,numDepartamento,numCallRevisaDepAct,function(dato){
   			 	if(dato != 0  && dato != undefined){
   			 	
   			 	var numActividad = numCallRevisaDepAct === valorActividades.length ? numCallRevisaDepAct-1 : numCallRevisaDepAct;
    			console.log(numDepartamento+'---Genera target----'+numCallRevisaDepAct+"-----"+numActividad);
    			var Informacion = `Se han agregado: ${dato} Nuevos Registros para la Actividad ${valorActividades[numActividad].Actividad} en el departamento de ${valorDepartamento[numDepartamento].Departamento} -- ${GeneraFechaHora()}`;
				//UltimasProcesos = `hora -- Los procesos de hoy son: ${numReg}`
   				//envioCorreos(Informacion);
   				}
   			});


		console.log(numCallRevisaDepAct+' ----- '+valorActividades.length);
   		if(numCallRevisaDepAct === valorActividades.length-1){
   			numCallRevisaDepAct=1;
   			console.log('Valor de Departamento '+numDepartamento);
   			if(numDepartamento < valorDepartamento.length-1){
   				numDepartamento++;
   				
   			}else{
   				console.log('Terminoooooooooooooooooooooooooooooooooooooooooo');
   				numCallRevisaDepAct = valorActividades.length;
   			}
   		}

   		if(numCallRevisaDepAct<valorActividades.length){
   			setTimeout(function(){
   				RevisaActividadesDepartamentos();
   			},1000);
   		}
   		
}
//-------------------------------------------------------------------------------------------------

function RevisionPorLotes(){
	numCallRevisaDepartamentos = 0;
	numCallRevisaActividades = 0;
	numCallRevisaDepAct = 0;
	numDepartamento = 1;

	//RevisaActividadesDepartamentos();
	RevisaActividades();
		
}

/*
function RevisionPorLotes(){
	RevisaActividades(function(dato){
		if (dato) {
		console.log('----------------Termino 1---------------------------------');	
			RevisaDepartamentos(function(data){
				if(data){
			console.log('----------------Termino 2---------------------------------');
					RevisaActividadesDepartamentos();
				}
			});
		};
	});
}
*/
//----------------------------------------------------------------------------------------------------------

//---------------------------------------------------Main--------------------------------------------------

setInterval(function(){ 
    //var trueCambios = validaNuevosRegistros();
    // -1 -1 para saber los de todo el pais

    var contador =1;
   	validaNewRegistros(0,-1,-1,function(dato){
    	if(dato != 0){
    	var Informacion = `Se han agregado: ${dato} Nuevos Registros en todo el país -- ${GeneraFechaHora()}`;
		//UltimasProcesos = `hora -- Los procesos de hoy son: ${numReg}`
   		envioCorreos(Informacion);
   			RevisionPorLotes();
   			//RevisionPorLotes();
   			//numCallRevisaDepartamentos=0;
   			//RevisaDepartamentos();
   			/*
   			RevisaActividades();
   			RevisaActividadesDepartamentos();
   			*/
    	}

    });
    	   		
}, 1000);
//-----------------------------------------------------------------------