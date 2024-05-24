require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { userDataValidation } = require("./utils/authUtil.js");
const userModel = require("./models/userModel.js");

//constants
const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); //only for form data
app.use(express.json()); //for uploading/reading through postman
//DB connection
mongoose
  .connect(process.env.MongoDB_URL)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log(err);
  });

//APIs
app.get("/", (request, response) => {
  response.send("Landing Page");
});

app.get("/login", (request, response) => {
  //   response.send("Login Page");
  return response.render("loginPage.ejs");
});

app.get("/register", (request, response) => {
  return response.render("registerPage.ejs");
});

app.post("/register", async (req, res) => {
  console.log(req.body);
  const { name, email, username, password } = req.body;
  try {
    await userDataValidation({ name, email, username, password });
  } catch (error) {
    return res.send({
      status: 400,
      message: "user data error",
      error: error,
    });
  }
  const userObj = new userModel({
    name: name,
    username: username,
    email: email,
    password: password,
  });

  try {
    const userDb = await userObj.save();
    return res.send({
      status: 201,
      message: "Registration Success",
      data: userDb,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: "Internal Server Error",
      error: error,
    });
  }

//   return res.send("Registeration success");
});

app.post("/login", (req, res) => {
  return res.send("Login success");
});

app.listen(PORT, () => {
  console.log(`Server runining here : http://localhost:${PORT}`);
});
console.log("ok");
