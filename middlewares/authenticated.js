'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = "clave-secreta-para-generar-el-token-9999";

exports.authenticate = function(req, res, next){

	// console.log("ESTAS PASANDO POR EL MIDDLEWARE");
	// Comprobar si llega autorización
	if(!req.headers.authorization){
		return res.status(403).send({
			message:'La peticion no tiene la cabecera de autorizacion'
		});
	}

	// Limpiar el token y quitar comillas
	var token = req.headers.authorization.replace(/['"]+/g, '');

	try{
		// Decodificar el token
		var payload = jwt.decode(token, secret);

		// Comprobar si el token ha expirado
		// Si la fecha de exp, es menor que unix, es que el token ha expirado
		if(payload.exp <= moment.unix()){
			return res.status(404).send({
				message:'El token ha expirado'
			});

		}


	}catch(ex){
		return res.status(404).send({
			message:'El token no es válido'
		});	
	}
	
	// Adjuntar usuario identificado a la request.
	req.user = payload;

	// Pasar a la accion

	next();
};