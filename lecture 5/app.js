const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoDBSession = require("connect-mongodb-session")(session);
const { cleanUpAndValidate } = require("./utils/AuthUtils");
const UserSchema = require("./UserSchema");

const app = express();

app.set("view engine", "ejs");

const mongoURI = `mongodb+srv://karan:12345@cluster0.3ije6wh.mongodb.net/auth-node`;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Connected to db successfully");
  })
  .catch((err) => {
    console.log("Failed to connect", err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const store = new mongoDBSession({
  uri: mongoURI,
  collection: "sessions",
});

// Adds the session object in req
app.use(
  session({
    secret: "hello backendjs",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//method ,end point, handler
app.get("/", (req, res) => {
  res.send("Welcome to our app");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { name, username, password, email } = req.body;
  console.log(req.body);
  // Validation of Data
  try {
    await cleanUpAndValidate({ name, username, password, email });
  } catch (err) {
    return res.send({
      status: 400,
      message: err,
    });
  }

  //Hash the password Plain text -> hash
  const hashedPassword = await bcrypt.hash(password, 13); // md5

  let user = new UserSchema({
    name: name,
    username: username,
    password: hashedPassword,
    email,
    email,
  });

  let userExists;
  // Check if user already exists
  try {
    userExists = await UserSchema.findOne({ email });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Internal Server Error. Please try again.",
      error: err,
    });
  }

  if (userExists)
    return res.send({
      status: 400,
      message: "User with email already exists",
    });

  try {
    const userDb = await user.save(); // Create Operation
    return res.send({
      status: 200,
      message: "Registration Successful",
      data: {
        _id: userDb._id,
        username: userDb.username,
        email: userDb.email,
      },
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Internal Server Error. Please try again.",
      error: err,
    });
  }
});

app.post("/login", async (req, res) => {
  // loginId can be either email or username
  const { loginId, password } = req.body;

  if (
    typeof loginId !== "string" ||
    typeof password !== "string" ||
    !loginId ||
    !password
  ) {
    return res.send({
      status: 400,
      message: "Invalid Data",
    });
  }

  // find() - May return you multiple objects, Returns empty array if nothing matches, returns an array of objects
  // findOne() - One object, Returns null if nothing matches, returns an object
  let userDb;
  try {
    if (validator.isEmail(loginId)) {
      userDb = await UserSchema.findOne({ email: loginId });
    } else {
      userDb = await UserSchema.findOne({ username: loginId });
    }
  } catch (err) {
    console.log(err);
    return res.send({
      status: 400,
      message: "Internal server error. Please try again",
      error: err,
    });
  }

  console.log(userDb);

  if (!userDb) {
    return res.send({
      status: 400,
      message: "User not found",
      data: req.body,
    });
  }

  // Comparing the password
  const isMatch = await bcrypt.compare(password, userDb.password);

  if (!isMatch) {
    return res.send({
      status: 400,
      message: "Invalid Password",
      data: req.body,
    });
  }

  //include session info to check further
  req.session.isAuth = true;
  req.session.user = {
    username: userDb.username,
    email: userDb.email,
    userId: userDb._id,
  };

  res.redirect("/home");
});

app.get("/home", (req, res) => {
  if (req.session.isAuth) {
    res.send("This is your Home page, Logged in successfully");
  } else {
    res.send("Invalid Session. Please logged In again.");
  }
});

app.listen(8000, () => {
  console.log("Listenning on port 8000");
});

//Create basic template for form with ejs
//clean up and validate function
//connect to DB
//password hash

// '/register' POST
//create user
//check user exist

// '/post' POST
// check invalid data
//find user with username or email
//compare the password

//Show home page
