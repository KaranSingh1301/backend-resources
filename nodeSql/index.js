const express = require("express");
const mysql = require("mysql");
const app = express();
app.use(express.json());
//Db config
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Karan@130101",
  database: "tododb",
  multipleStatements: true,
});

db.connect(function (err) {
  if (err) throw err;
  console.log("DB Connected!");
});

app.get("/", (req, res) => {
  res.send("welcome to my server");
});

app.get("/todo", (req, res) => {
  db.query("SELECT * FROM users", {}, (err, user) => {
    console.log(user);
    if (user) {
      return res.send({
        status: 200,
        message: "success",
        data: user,
      });
    } else {
      return res.status(200).send(false);
    }
  });
});

app.get("/todo", (req, res) => {
  db.query("SELECT * FROM users", {}, (err, user) => {
    console.log(user);
    if (user) {
      return res.send({
        status: 200,
        message: "success",
        data: user,
      });
    } else {
      return res.status(200).send(false);
    }
  });
});

app.post("/register", (req, res) => {
  const newUser = req.body;
  console.log(req.body);
  db.query(
    "INSERT INTO users (todoId, userName, email, password) VALUES (?,?,?,?)",
    ["1345", newUser.name, newUser.email, newUser.password],
    (err, user) => {
      if (err) {
        console.log(err);
        return res.status(400);
      } else {
        return res.status(200).send(true);
      }
    }
  );
});

app.listen(8000, () => {
  console.log("Listenning to port 8000");
});
