'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var router = express.Router();

// Creamos el middleware
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});

// Rutas de prueba
router.get('/probando', UserController.probando);
router.post('/testeando', UserController.testeando);

// Rutas de usuario
router.post('/register', UserController.save);
router.post('/login', UserController.login);

// Pasa por el middleware md_auth, por su metodo authenticated
router.put('/user/update', md_auth.authenticate, UserController.update);
// Usamos dos middlewares, el de authenticate y el de subida de fichero
//router.post('/upload-avatar/:id', [md_auth.authenticate, md_upload], UserController.uploadAvatar);
router.post('/upload-avatar', [md_auth.authenticate, md_upload], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);

module.exports = router;