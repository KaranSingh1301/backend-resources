const express = require("express");
const clc = require("cli-color");
const session = require("express-session");
const mongoDBSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
require("dotenv").config();

const db = require("./db");
const AuthRouter = require("./Controllers/Auth");
const BlogsRouter = require("./Controllers/Blogs");

const app = express();
const PORT = process.env.PORT || 8000;

//mongodbConnection

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// app.use(notFound);

//Adding the session
const store = new mongoDBSession({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to bloggin app");
});

//routing

// Authentication Router
app.use("/auth", AuthRouter);
app.use("/blog", BlogsRouter);

app.listen(PORT, () => {
  console.log(clc.red.bgCyan.underline("Your server is running at "));
  console.log(clc.yellow.underline(`http://localhost:${PORT}`));
});
