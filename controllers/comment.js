'user strict'

var Topic = require('../models/topic');
var validator = require('validator');

var controller = {
	add:function(req, res){

		// Recoger el id de topic por la url
		var topicId = req.params.topicId;

		// Find por el id del topic
		Topic.findById(topicId).exec((err, topic)=>{

			if(err){
				return res.status(500).send({
					status: 'error',
					message:'Error en la peticion'
				});
			}

			if(!topic){
				return res.status(404).send({
					status: 'error',
					message:'No existe el tema'
				});
			}

			// comprobar objeto usuario y validar datos
			if(req.body.content){

				// Validar los datos
				try{

					var validate_content = !validator.isEmpty(req.body.content);

				}catch(err){
					return res.status(200).send({
						message: 'No has comentado nada'
					});
				}

				if(validate_content){

					var comment = {
						user: req.user.sub,
						content: req.body.content
					};
					// EN la propiedad comments del objeto resultante hacer un push
					topic.comments.push(comment);

					// Guardar el topic completo
					topic.save((err)=>{

						if(err){
							return res.status(500).send({
								status: 'error',
								message:'Error al guardar el comentario'
							});
						}

						// Find por el id del topic
						Topic.findById(topic._id)
							.populate('user')
							.populate('comments.user')
							.exec((err, topic)=>{

								if(err){
									// Devolver un error
									return res.status(500).send({
										status:'error',
										message:'Error en la peticion'
									});	
								}
								if(!topic){
									// Devolver un error
									return res.status(400).send({
										status:'error',
										message:'No existe el topic'
									});
								}
								// Devolver un resultado
								return res.status(200).send({
									status:'success',
									topic
								});	
							

							});
	
					});
					
				}else{
					return res.status(200).send({
						message: 'No se han validado los datos del comentario'
					});
				}

			}

			
		});
		
	},
	update:function(req, res){

		// Conseguir id del comentario 
		var commentId =req.params.commentId;

		// Recoger datos y validar
		var params = req.body;
		// Validar los datos
		try{

			var validate_content = !validator.isEmpty(params.content);

		}catch(err){
			return res.status(200).send({
				message: 'No has comentado nada'
			});
		}

		if(validate_content){
			// Find and udpdate de subdocumento
			Topic.findOneAndUpdate(
				{'comments._id': commentId},
				{
					"$set":{
						"comments.$.content": params.content 	// $ hace referencia al elemento encontrado en comments
					}
				},
				{new:true},
				(err,topicUpdated)=>{
					
					if(err){
						return res.status(500).send({
							status: 'error',
							message:'Error en la peticion'
						});
					}

					if(!topicUpdated){
						return res.status(404).send({
							status: 'error',
							message:'No existe el tema'
						});
					}

					// Devolver los datos
					return res.status(200).send({
						status:'success',
						topic:topicUpdated
					});
				}
			);

			
		}

	},
	delete:function(req, res){
		
		// Sacar el id del topic y del comentario a borrar
		var topicId = req.params.topicId;
		var commentId = req.params.commentId;

		// Buscar el topic
		Topic.findById(topicId, (err, topic)=>{

			if(err){
				return res.status(500).send({
					status: 'error',
					message:'Error en la peticion'
				});
			}

			if(!topic){
				return res.status(404).send({
					status: 'error',
					message:'No existe el tema'
				});
			}

			// Seleccionar el subdocumento (comentario)
			var comment = topic.comments.id(commentId);

			// Borrar el comentario
			if(comment){
				comment.remove();

				// Guardar el topic
				topic.save((err)=>{
					if(err){
						return res.status(500).send({
							status: 'error',
							message:'Error en la peticion'
						});
					}
					
					// Find por el id del topic
					Topic.findById(topic._id)
						.populate('user')
						.populate('comments.user')
						.exec((err, topic)=>{

							if(err){
								// Devolver un error
								return res.status(500).send({
									status:'error',
									message:'Error en la peticion'
								});	
							}
							if(!topic){
								// Devolver un error
								return res.status(400).send({
									status:'error',
									message:'No existe el topic'
								});
							}
							// Devolver un resultado
							return res.status(200).send({
								status:'success',
								topic
							});	
						

						});

				});
				
			}else{
				return res.status(404).send({
					message:'No existe el comentario'
				});

			}
			
		});

	}
};

module.exports = controller;