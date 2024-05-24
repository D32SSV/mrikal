const express = require('express')
const router = express.Router()
const usersController = require('../controller/userController')
const rateLimiting = require("./middlewares/rateLimiting");
const { isAuth } = require("./middlewares/authMiddleware");

router.use(isAuth)
router.use(rateLimiting);


router.route('/')
    .get(userController.login)
    .get(userController.register)
    .post(userController.registerUser)
    .post(userController.loginUser)

module.exports = router