const express = require('express')
const router = express.Router()
const usersController = require('../controller/todoController')
const { isAuth } = require("./middlewares/authMiddleware");
const rateLimiting = require("./middlewares/rateLimiting");

router.use(isAuth)
router.use(rateLimiting);



router.route('/')
    .get(toDoController.dashboad)
    .get(toDoController.register)
    .get(toDoController.readItem)
    .post(toDoController.createItem)
    .post(toDoController.logout)
    .post(toDoController.editItem)
    .post(toDoController.deleteItem)

module.exports = router