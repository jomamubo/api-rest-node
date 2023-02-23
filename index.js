'use strict'

var mongoose = require('mongoose'); // Carga la libreria de mongoose
var app = require('./app'); // Cargamos el modulo app.js que hemos creado
var port = process.env.PORT || 3999;  // Coge el puerto de process.env.port o si no crea el puerto 3999

// Configuracion del mongoose, para deshabilitar un posible error por console
// mongoose.set('useFindAndModify', false); 
// En nuestro caso, esto no es necesario, porque utilizamos una version mas moderna

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node', { useNewUrlParser: true})
		.then(()=>{
			console.log('La conexion a Mongo se ha realizado correctamente');

			// Crear el servidor
			app.listen(port, ()=>{
				console.log("El servidor http://localhost:3999 está funcionando!!");
			});
		})
		.catch(error=>console.log(error));
