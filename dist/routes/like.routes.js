"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeRouter = void 0;
const express_1 = require("express");
const like_controller_1 = require("../controllers/like.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes are protected
router.post('/post/:postId', auth_middleware_1.authenticateToken, like_controller_1.likeController.likePost);
router.delete('/post/:postId', auth_middleware_1.authenticateToken, like_controller_1.likeController.unlikePost);
router.post('/comment/:commentId', auth_middleware_1.authenticateToken, like_controller_1.likeController.likeComment);
router.delete('/comment/:commentId', auth_middleware_1.authenticateToken, like_controller_1.likeController.unlikeComment);
exports.likeRouter = router;
