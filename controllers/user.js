'user strict'

var validator = require('validator');
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs'); // Para poder trabajar con fichero avatar
var path = require('path');
var jwt = require('../services/jwt'); // Para autenticacion

var controller = {
	probando: function(req, res){
		return res.status(200).send({
			'mensaje': 'Soy el metodo probando con GET'
		});
	},
	testeando: function(req, res){
		return res.status(200).send({
			'mensaje': 'Soy el metodo testeando con POST'
		});
	},

	save: function(req, res){
		//Recoger los parametros de la peticion
		var params = req.body;

		// Validar los datos
		try{

			var validate_name = !validator.isEmpty(params.name);
			var validate_surname = !validator.isEmpty(params.surname);
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
			var validate_password = !validator.isEmpty(params.password);

		}catch(exception){
			return res.status(200).send({
				message: 'Faltan datos por enviar',
				params
			});
		}

		// console.log(validate_name, validate_surname, validate_email, validate_password);
		if( validate_name && validate_surname && validate_email && validate_password ){
			// Crear objeto de usuario
			var user = new User();

			// Asignar valores al usuario
			user.name = params.name;
			user.surname = params.surname;
			user.email = params.email.toLowerCase();
			user.role = 'ROLE_USER';
			user.image = null;

			// Comprobar si el usuario existe
			User.findOne({email:user.email}, (err, issetUser)=>{
				if(err){
					return res.status(500).send({
						'message':'Error al comprobar duplicidad de usuario'
					});
				}

				if(!issetUser){
					// Si no existe, 
					//cifrar pass 
					bcrypt.hash(params.password, null, null, (err, hash)=>{
						user.password = hash;

						// guardar usuarios
						user.save((err, userStored)=>{
							if(err){
								return res.status(500).send({
									'message':'Error al guardar el usuario'
								});
							}

							if(!userStored){
								// Devolver respuesta
								return res.status(400).send({
									'message':'El usuario no se ha guardado',
									user
								});
							}

							// Devolver respuesta
							return res.status(200).send({
								status: 'success',
								user: userStored
							});

						}); // close save
					});	// close bcrypt

				}else{
					return res.status(200).send({
						'message':'El usuario ya está registrado'
					});
				}
			});

			

		}else{
			// Devolver respuesta
			return res.status(200).send({
				'message':'Validacion de los datos del usuario incorrecta, intentalo de nuevo'
			});
		}
	},

	login: function(req, res){
		// Recoger parametros de peticion
		var params = req.body;

		// Validar los datos
		try{

			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
			var validate_password = !validator.isEmpty(params.password);

		}catch(exception){
			return res.status(200).send({
				message: 'Faltan datos por enviar',
				params
			});
		}
		if(!validate_email || !validate_password){
			// Devolver los datos
			return res.status(200).send({
				message: 'Los datos son incorrectos, envialos bien'
			})
		}
		

		// Buscar usuarios que coincidan con el mail
		User.findOne({email:params.email.toLowerCase()}, (err, user)=>{

			if(err){
				return res.status(500).send({
					message: 'Error al intentar identificarse'
				});
			}
			// Si lo encuentra,
			if(!user){
				return res.status(400).send({
					message: 'El usuario no existe'
				});
			}
			// Comprobar la constraseña (coincidencia de email y password / bcrypt)
			// Si es correcto
			bcrypt.compare(params.password, user.password, (err, check)=>{
				
				if(check){
					// Generar token jwt y devolverlo
					if(params.gettoken){
						// Devolver el token generado con los datos del usuario
						return res.status(200).send({
							token: jwt.createToken(user)
						});

					}else{
						// Limpiar el objecto, (para evitar que la password se devuelva al cliente
						user.password = undefined;

						// Devolver los datos
						return res.status(200).send({
							message: 'success',
							user
						});	
					}
					
				}else{
					return res.status(200).send({
						message: 'Las credenciales no son correctas'
					});
				}
					
			});
			
		});
	
	},

	update: function(req,res){
		// Recoger los datos del usuario
		var params = req.body;

		// Validar datos
		// Validar los datos
		try{

			var validate_name = !validator.isEmpty(params.name);
			var validate_surname = !validator.isEmpty(params.surname);
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);

		}catch(err){
			return res.status(200).send({
				message: 'Faltan datos por enviar',
				params
			});
		}

		// Eliminar propiedades innecesarias
		delete params.password;

		var userId = req.user.sub;

		// Comprobar si el email es unico
		if(req.user.email != params.email){

			User.findOne({email:params.email.toLowerCase()}, (err, user)=>{

				if(err){
					return res.status(500).send({
						message: 'Error al intentar identificarse'
					});
				}
				// Si lo encuentra,
				if(user && user.email == params.email){
					return res.status(200).send({
						message: 'El email no puede ser modificado'
					});
				}else{
					User.findOneAndUpdate({_id:userId}, params, {new:true}, (err, userUpdated)=>{

						if(err){
							// Devolver un error
							return res.status(500).send({
								status:'error',
								message:'Error al actualizar el usuario'
							});	
						}

						if(!userUpdated){
							// Devolver un error
							return res.status(200).send({
								status:'error',
								message:'No se ha actualizado el usuario'
							});	
						}

						// Devolver una respuesta
						return res.status(200).send({
							status: 'success',
							user:userUpdated
						});		
					});
				}
			});

		}else{


			// Buscar y actualizar documento de bd
			// User.findOneAndUpdate(condicion, datos-a-actualizar, opciones, callback);
			// new:true, para que me devuelva el objeto nuevo
			User.findOneAndUpdate({_id:userId}, params, {new:true}, (err, userUpdated)=>{

				if(err){
					// Devolver un error
					return res.status(500).send({
						status:'error',
						message:'Error al actualizar el usuario'
					});	
				}

				if(!userUpdated){
					// Devolver un error
					return res.status(200).send({
						status:'error',
						message:'No se ha actualizado el usuario'
					});	
				}

				// Devolver una respuesta
				return res.status(200).send({
					status: 'success',
					user:userUpdated
				});		
			});
		}
		
	},

	uploadAvatar: function(req, res){
		// Configurar el módulo multiparty (md)   
		//    Hecho en routes/user.js

		// Recoger el fichero de la peticion
		var file_name = 'Avatar no subido...';

		// Multiparty habilita el req.files
		// console.log(req.files);
		if(!req.files){
			// Devolver una respuesta
			return res.status(404).send({
				status: 'error',
				message: file_name
			});					
		}
			
		// Conseguir el nombre y la extension del archivo
		var file_path = req.files.file0.path;
		// console.log(file_path);
		var file_split = file_path.split('\\');

		// ** Advertencia ** En Linux o Mac
		// var file_split = file_path.split('/');

		// Nombre del archivo
		var file_name = file_split[2];

		// Extension del archivo
		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		// Comprobar extension, solo imagenes, si no es valida, borramos el fichero subido
		if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' &&
			file_ext != 'gif'){

			fs.unlink(file_path, (err)=>{
				// Devolver una respuesta
				return res.status(400).send({
					status: 'error',
					mesage: 'La extension del archivo no es valido',
					file: file_ext
				});	
			});
		}else{
			
			// Sacar el id del usuario identificado
			var userId = req.user.sub;

			// Buscar y actualizar documento ddbb
			User.findOneAndUpdate({_id: userId}, {image: file_name}, {new:true}, (err, userUpdated)=>{
				
				if(err || !userUpdated){
					
					// Devolver una respuesta
					return res.status(500).send({
						status: 'error',
						mesage: 'Error al guardar el usuario'
					});									
				}

				// Devolver una respuesta
				return res.status(200).send({
					status: 'success',
					// mesage: 'Ok, proceso completado',
					// file: file_ext
					user: userUpdated
				});				
			});
		}
	},

	avatar: function(req, res){
		var fileName = req.params.fileName;
		var pathFile = './uploads/users/'+fileName;

		fs.exists(pathFile, (exists)=>{
			if(exists){
				res.sendFile(path.resolve(pathFile));
			}else{
				// Devolver una respuesta
				return res.status(404).send({
					mesage: 'La imagen no existe',
					path: pathFile
				});
			}
		});

	},

	getUsers: function(req, res){
		User.find().exec((err, users) => {
			if(err || !users){
				return res.status(404).send({
					status:'error',
					mesage: 'No hay usuarios que mostrar'
				});
			}

			return res.status(200).send({
				status:'success',
				users: users
			});

		});
	},

	getUser: function(req,res){
		var userId = req.params.userId;

		User.findById(userId).exec((err, user)=>{
			if(err || !user){
				return res.status(404).send({
					status:'error',
					mesage: 'No existe el usuario'
				});
			}

			return res.status(200).send({
				status:'success',
				users: user
			});
		});

	}

};


module.exports = controller;