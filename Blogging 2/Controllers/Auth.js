const express = require("express");
const AuthRouter = express.Router();
const User = require("../Models/User");
const { cleanUpAndValidate } = require("../Utils/AuthUtils");

AuthRouter.post("/register", async (req, res) => {
  const { email, username, password, name, phoneNumber, profilePic } = req.body;

  // Validate data
  cleanUpAndValidate({ email, username, phoneNumber, password })
    .then(async () => {
      // Validate if user is already registered
      try {
        await User.verifyUsernameAndEmailExists({ username, email });
      } catch (err) {
        return res.send({
          status: 401,
          message: "Error Occured",
          error: err,
        });
      }

      // Save the data in db

      const user = new User({
        email,
        username,
        password,
        name,
        phoneNumber,
      });

      try {
        const dbUser = await user.registerUser();

        // Newletter, Welcome email

        return res.send({
          status: 200,
          message: "Registration Successfull",
          data: dbUser,
        });
      } catch (err) {
        return res.send({
          status: 401,
          message: "Internal error",
          error: err,
        });
      }
    })
    .catch((err) => {
      return res.send({
        status: 400,
        message: "Invalid Data",
        error: err,
      });
    });
});

AuthRouter.post("/login", async (req, res) => {
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    return res.send({
      status: 401,
      message: "Invalid Credentials",
    });
  }

  try {
    const dbUser = await User.loginUser({ loginId, password });

    req.session.isAuth = true;
    req.session.user = {
      userId: dbUser._id,
      email: dbUser.email,
      username: dbUser.username,
      name: dbUser.name,
    };

    return res.send({
      status: 200,
      message: "Login Successful",
      data: dbUser,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Error Occured",
      errror: err,
    });
  }
});

AuthRouter.post("/logout", (req, res) => {
  const userData = req.session.user;

  req.session.destroy((err) => {
    if (err) {
      return res.send({
        status: 400,
        message: "Loggout unsucceeful",
        errror: err,
      });
    }

    return res.send({
      status: 200,
      message: "Logg out Successful",
      data: userData,
    });
  });
});

module.exports = AuthRouter;
