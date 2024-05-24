const { userDataValidation } = require("./utils/authUtil.js");
const userModel = require("./models/userModel.js");
const bcrypt = require("bcrypt");
// const session = require("express-session");
// const { isAuth } = require("./middlewares/authMiddleware");

const login = (request, response) => {
  //   response.send("Login Page");
  return response.render("loginPage.ejs");
};
const register = (request, response) => {
  return response.render("registerPage.ejs");
};

const registerUser = async (req, res) => {
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

  const userEmailExist = await userModel.findOne({ email });
  if (userEmailExist) {
    return res.send({
      status: 400,
      message: "Email already exist",
    });
  }

  const userUsernameExist = await userModel.findOne({ username });
  if (userUsernameExist) {
    return res.send({
      status: 400,
      message: "Username already exist",
    });
  }

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.SALT)
  );
  const userObj = new userModel({
    name: name,
    username: username,
    email: email,
    password: hashedPassword,
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
};

const loginUser = async (req, res) => {
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    return res.send({
      status: 400,
      message: "Missing credentials",
    });
  }
  //find the user from DB with loginId
  try {
    let userDb;
    if (validator.isEmail(loginId)) {
      userDb = await userModel.findOne({ email: loginId });
    } else {
      userDb = await userModel.findOne({ username: loginId });
    }

    if (!userDb) {
      return res.send({
        status: 400,
        message: "User not found, please register",
      });
    }

    //compare the password
    const isMatched = await bcrypt.compare(password, userDb.password);
    if (!isMatched) {
      return res.send({
        status: 400,
        message: "Password does not matched",
      });
    }

    //session base auth
    req.session.isAuth = true;
    req.session.user = {
      userId: userDb._id,
      email: userDb.email,
      username: userDb.username,
    };
    return res.send("Login success");
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal Server Error",
      error: error,
    });
  }
};

module.exports = { login, register, loginUser, registerUser };
