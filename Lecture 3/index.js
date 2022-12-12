const express = require("express");

const app = express();

//method ,end point, handler
app.get("/", (req, res) => {
  res.send("It is a GET request");
});

app.post("/", (req, res) => {
  res.send("IT is a POST request");
});

app.get("/myapp", (req, res) => {
  console.log(req.query);
  // ?key=value
  res.send("This is /myapp route");
});

//Dynamic route
app.get("/app/:id/:name", (req, res) => {
  // /app/aman
  console.log(req.params);
  res.send("This is my /app route");
});

app.listen(8000, () => {
  console.log("Listenning on port 8000");
});
