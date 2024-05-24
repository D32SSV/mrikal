// const { isAuth } = require("./middlewares/authMiddleware");
const todoModel = require("./models/todoModel");
// const rateLimiting = require("./middlewares/rateLimiting");
const session = require("express-session");
const mongoDbsession = require("connect-mongodb-session")(session);

const dashboard =
  (isAuth,
  (req, res) => {
    return res.render("dashboardPage");
  });

const logout =
  (isAuth,
  (req, res) => {
    // id = req.session.id
    // sessionModel.findOneAndDelete({_id : id})
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json("Logout unsuccessfull");
      } else {
        return res.status(200).redirect("/login");
      }
    });
  });

//TODO API's

const createItem =
  (isAuth,
  rateLimiting,
  async (req, res) => {
    //todoText, username
    const todoText = req.body.todo;
    const username = req.session.user.username;

    //data validation
    if (!todoText) {
      return res.status(400).json("Missing todo text.");
    } else if (typeof todoText !== "string") {
      return res.status(400).json("Todo is not a text");
    } else if (todoText.length < 3 || todoText.length > 200)
      return res.send({
        status: 400,
        message: "Todo length should be 3-200",
      });

    const todoObj = new todoModel({
      todo: todoText,
      username: username,
    });

    try {
      const todoDb = await todoObj.save();
      return res.send({
        status: 201,
        message: "Todo created successfully",
        data: todoDb,
      });
    } catch (error) {
      return res.send({
        status: 500,
        message: "Database error",
        error: error,
      });
    }
  });

// /read-item?skip=20
const readItem =
  (isAuth,
  async (req, res) => {
    const username = req.session.user.username;
    const SKIP = Number(req.query.skip) || 0;
    const LIMIT = 5;

    //mongodb agggregate, skip, limit, match
    try {
      const todos = await todoModel.aggregate([
        {
          $match: { username: username },
        },
        {
          $facet: {
            data: [{ $skip: SKIP }, { $limit: LIMIT }],
          },
        },
      ]);

      if (todos[0].data.length === 0) {
        return res.send({
          status: 400,
          message: SKIP === 0 ? "No todos found" : "No more todos",
        });
      }

      // console.log(todos[0].data);
      return res.send({
        status: 200,
        message: "Read success",
        data: todos[0].data,
      });
    } catch (error) {
      return res.send({
        status: 500,
        message: "Database error",
        error: error,
      });
    }
  });

const editItem =
  (isAuth,
  rateLimiting,
  async (req, res) => {
    //id, todo, username
    const { id, newData } = req.body;
    const username = req.session.user.username;

    //find the todo

    try {
      const todoDb = await todoModel.findOne({ _id: id });

      if (!todoDb)
        return res.send({
          status: 400,
          message: "Todo not found",
        });

      //check the ownership
      if (username !== todoDb.username)
        return res.send({
          status: 403,
          message: "Not authorized to edit the todo",
        });

      const prevTodo = await todoModel.findOneAndUpdate(
        { _id: id },
        { todo: newData } // {key1 : val1, key2:val2}
      );

      return res.send({
        status: 200,
        message: "Todo edited successfully",
        data: prevTodo,
      });
    } catch (error) {
      return res.send({
        status: 500,
        message: "Database error",
        error: error,
      });
    }
  });

const deleteItem =
  (isAuth,
  rateLimiting,
  async (req, res) => {
    const id = req.body.id;
    const username = req.session.user.username;

    if (!id) return res.status(400).json("Missing todo id");

    //find, compare, delete
    try {
      const todoDb = await todoModel.findOne({ _id: id });

      if (!todoDb) return res.status(404).json(`Todo not found with id :${id}`);

      if (todoDb.username !== username)
        return res
          .status(403)
          .json("Not allow to delete, authorization failed");

      const deletedTodo = await todoModel.findOneAndDelete({ _id: id });

      return res.send({
        status: 200,
        message: "Todo deleted successfully",
        data: deletedTodo,
      });
    } catch (error) {
      return res.send({
        status: 500,
        message: "Database error",
        error: error,
      });
    }
  });

module.exports = {
  dashboard,
  readItem,
  createItem,
  logout,
  editItem,
  deleteItem,
};
