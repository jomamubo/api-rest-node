'use strict'

var express = require('express');
var CommentController = require('../controllers/comment');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

router.post('/comment/topic/:topicId', md_auth.authenticate ,CommentController.add);
router.put('/comment/:commentId?', md_auth.authenticate ,CommentController.update);
router.delete('/comment/:topicId/:commentId', md_auth.authenticate, CommentController.delete);
module.exports = router;