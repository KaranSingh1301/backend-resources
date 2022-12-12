const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("welcome to my server");
});

app.listen(8000, () => {
  console.log("Listenning to port 3000");
});
