const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("welcome to my server");
});

app.get("/api/:id", (req, res) => {
  console.log(req.params.id);
  try {
    return res.send({
      status: 200,
      message: "url decoded successfully",
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "url not decoded",
    });
  }
});

app.listen(8000, () => {
  console.log("Listenning to port 8000");
});
