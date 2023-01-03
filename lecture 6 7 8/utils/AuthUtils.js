const Jwt = require("jsonwebtoken");
const validator = require("validator");
const nodemailer = require("nodemailer");
const cleanUpAndValidate = ({ name, password, email, username }) => {
  return new Promise((resolve, reject) => {
    if (typeof email != "string") reject("Invalid Email");
    if (typeof password != "string") reject("Invalid Password");
    if (typeof name != "string") reject("Invalid Name");
    if (typeof username != "string") reject("Invalid Username");

    if (!email || !password || !username) reject("Invalid data");

    if (!validator.isEmail(email)) reject("Invalid email");

    if (username.length < 3) reject("Username too short");

    if (username.length > 50) reject("Username too long");

    if (password.length < 5) reject("Password too short");

    if (password.length > 200) reject("Password too long");

    resolve();
  });
};

const jwtSign = (email) => {
  const JWT_TOKEN = Jwt.sign({ email: email }, "backendnodejs", {
    expiresIn: "15d",
  });
  return JWT_TOKEN;
};

const sendVerificationEmail = (email, verficationToken) => {
  console.log(email, verficationToken);
  let mailer = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: "Gmail",
    auth: {
      user: "kssinghkaran13@gmail.com",
      pass: "mqfbwhneeoowihig",
    },
  });

  let sender = "Todo App";
  let mailOptions = {
    from: sender,
    to: email,
    subject: "Email Verification Todo App",
    html: `Press <a href=http://localhost:8000/verifyEmail/${verficationToken}> here </a> to verify your account.`,
  };

  mailer.sendMail(mailOptions, function (error, response) {
    if (error) console.log(error);
    else console.log("Mail sent successfully");
  });
};

module.exports = { cleanUpAndValidate, jwtSign, sendVerificationEmail };
