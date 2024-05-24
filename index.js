require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const session = require("express-session");
const mongoDbsession = require("connect-mongodb-session")(session);

//constants
const app = express();
const PORT = process.env.PORT || 3000;
const store = new mongoDbsession({
  uri: process.env.MongoDB_URL,
  collection: "sessions",
});

//middlewares
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); //only for form data
app.use(express.json()); //for uploading/reading through postman
app.use(
  session({
    secret: process.env.Secret_Key,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

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






app.listen(PORT, () => {
  console.log(`Server runining here : http://localhost:${PORT}`);
});
console.log("ok");
