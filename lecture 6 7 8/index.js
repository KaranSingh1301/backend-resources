const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mongoose = require("mongoose");
const Jwt = require("jsonwebtoken");
const session = require("express-session");

const mongoDBSession = require("connect-mongodb-session")(session);
const {
  cleanUpAndValidate,
  sendVerificationEmail,
  jwtSign,
} = require("./utils/AuthUtils");
const UserSchema = require("./UserSchema");
const cors = require("cors");
const helmet = require("helmet");

const PORT = process.env.PORT || 8000;

// Import Models
const TodoModel = require("./models/TodoModel");

//Import Middleware
const isAuth = require("./middlerware/isAuth");
const rateLimiting = require("./middlerware/rateLimiting");
// const express = require("express");

const app = express();

app.set("view engine", "ejs");

//mongodb connection
mongoose.set("strictQuery", false);
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

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());

//Adding the session
const store = new mongoDBSession({
  uri: mongoURI,
  collection: "sessions",
});

app.use(
  session({
    secret: "hello backendjs",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//All the routes
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
    emailAuthenticated: false,
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

  //generate and send email verification token

  const verficationToken = jwtSign(email);
  console.log(verficationToken);
  try {
    const userDb = await user.save(); // Create Operation
    sendVerificationEmail(email, verficationToken);

    return res.send({
      status: 200,
      message:
        "Verification mail has been send to you mail ID. Please verify before login",
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

app.get("/verifyEmail/:verificationToken", async (req, res) => {
  const token = req.params.verificationToken;
  console.log(token);
  Jwt.verify(token, "backendnodejs", async (err, verifiedJwt) => {
    if (err) {
      res.send(err);
    } else {
      // console.log(verifiedJwt.email);
      // return res.status(200).redirect("/login");

      const userdb = await UserSchema.findOneAndUpdate(
        { email: verifiedJwt.email },
        { emailAuthenticated: true }
      );

      if (userdb) {
        return res.status(200).redirect("/login");
      } else {
        return res.send({
          status: 400,
          message: "User not found. Invalid Session link",
        });
      }
    }
  });
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

  if (userDb.emailAuthenticated === false) {
    return res.send({
      status: 400,
      message: "Please verified your mail id",
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

  res.redirect("/dashboard");
});

app.get("/home", (req, res) => {
  if (req.session.isAuth) {
    res.send("This is your Home page, Logged in successfully");
  } else {
    res.send("Invalid Session. Please logged In again.");
  }
});

app.post("/logout", (req, res) => {
  console.log(req.session);
  console.log(req.session.id);

  req.session.destroy((err) => {
    if (err) throw err;

    res.redirect("/");
  });
});

// Delete all sessions of the current user
app.post("/logout_from_all_devices", isAuth, async (req, res) => {
  console.log("here", req.session.user.username);
  const username = req.session.user.username;

  const Schema = mongoose.Schema;

  const sessionSchema = new Schema({ _id: String }, { strict: false });
  const SessionModel = mongoose.model("sessions", sessionSchema);

  try {
    const sessionsDb = await SessionModel.deleteMany({
      "session.user.username": username,
    });

    console.log(sessionsDb);

    res.send({
      status: 200,
      message: "Logged out of all devices",
    });
  } catch (err) {
    res.send({
      status: 400,
      message: "Logout Failed",
      error: err,
    });
  }
});

// ToDo App API's
app.get("/dashboard", isAuth, async (req, res) => {
  // let todos = [];

  // try {
  //   todos = await TodoModel.find({ username: req.session.user.username });
  //   // return res.send({
  //   //     status: 200,
  //   //     message: "Read successful",
  //   //     data: todos
  //   // })
  //   console.log(todos);
  // } catch (err) {
  //   return res.send({
  //     status: 400,
  //     message: "Database Error. Please try again",
  //   });
  // }
  // res.render("dashboard", { todos: todos });
  res.render("dashboard");
});

app.post("/pagination_dashboard", isAuth, rateLimiting, async (req, res) => {
  const skip = req.query.skip || 0;
  const LIMIT = 5;
  const username = req.session.user.username;

  try {
    // Read the first 5 todos -> Read -> find({username: "ritik"}) skip limit
    // Aggregation -> If we want perform multiple actions in a mongodb query, we can use aggregation

    let todos = await TodoModel.aggregate([
      { $match: { username: username } },
      {
        $facet: {
          data: [{ $skip: parseInt(skip) }, { $limit: LIMIT }],
        },
      },
    ]);

    return res.send({
      status: 200,
      message: "Read Successful",
      data: todos,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Database error. Please try again",
      error: err,
    });
  }
});

app.post("/create-item", isAuth, rateLimiting, async (req, res) => {
  console.log(req.body);

  const todoText = req.body.todo;

  console.log(todoText);

  if (!todoText) {
    return res.send({
      status: 404,
      message: "Missing Parameters",
    });
  }

  if (todoText.length > 100) {
    return res.send({
      status: 400,
      message: "Todo too long. Max characters allowed is 100.",
    });
  }

  let todo = new TodoModel({
    todo: todoText,
    username: req.session.user.username,
  });

  try {
    const todoDb = await todo.save();
    return res.send({
      status: 200,
      message: "Todo created successfully",
      data: todoDb,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Database error. Please try again",
      error: err,
    });
  }
});

app.post("/edit-item", isAuth, async (req, res) => {
  console.log(req.body);
  const id = req.body.id;
  const newData = req.body.newData; // {todo: "A todo"}

  if (!id || !newData) {
    return res.send({
      status: 404,
      message: "Missing Paramters.",
      error: "Missing todo data",
    });
  }

  try {
    const todoDb = await TodoModel.findOneAndUpdate(
      { _id: id },
      { todo: newData }
    );
    return res.send({
      status: 200,
      message: "Update Successful",
      data: todoDb,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Database Error. Please try again",
      error: err,
    });
  }
});

app.post("/delete-item", isAuth, async (req, res) => {
  const id = req.body.id;

  if (!id) {
    return res.send({
      status: 404,
      message: "Missing parameters",
      error: "Missing id of todo to delete",
    });
  }

  try {
    const todoDb = await TodoModel.findOneAndDelete({ _id: id });

    return res.send({
      status: 200,
      message: "Todo Deleted Succesfully",
      data: todoDb,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Database error. Please try again.",
      error: err,
    });
  }
});

app.post("/read-items", isAuth, async (req, res) => {
  try {
    const todoDb = await TodoModel.find({
      username: req.session.user.username,
    });

    return res.send({
      status: 200,
      message: "Read all Todo successfully",
      data: todoDb,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Database error. Please try again.",
      error: err,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Listenning on port ${PORT}`);
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

//Lgout, all device
//provide authentication to all the crud opt
//provide limit
//unauth user : (session base)
//one account : limit
//multiple account : 2FA (token)

// add a limit - charcter and limit the number of aPI calls
