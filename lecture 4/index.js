const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  res.send({
    status: 200,
    message: "Successfull",
    data: "This is my api",
  });
});

//Dynamic route
app.get("/app/:id/:name", (req, res) => {
  // /app/aman
  console.log(req.params);
  res.send("This is my /app route");
});

//lecture 5

app.get("/myapi", (req, res) => {
  res.send({
    status: 200,
    message: "Successfull",
    data: "This is my api",
  });
});

app.get("/karan", (req, res) => {
  res.send(`
     <html>
        <head> </head>
        <body> 
            <p> My form</p>
            <form action="/submit_form" method="POST">
            <label for="name"> Name </label>
            <input type = "text" name = "name" required></input>
            <label for="grade"> Grade </label>
            <input type = "text" name = "grade" required></input>
            <label for="phone"> Phone </label>
            <input type = "text" name = "phone" required></input>
            <button type="submit">Submit </button>
        </body>
     </html>
    `);
});

// app.post("/submit_form", (req, res) => {
//   console.log(req.body);
//   res.send("Form submitted");
// });

app.post("/submit_form", (req, res) => {
  console.log(req.body);
  const { name, grade, phone } = req.body;
  if (!grade || !phone || !grade) {
    return res.send({
      status: 400,
      message: "Mmissing data",
      data: req.body,
    });
  }

  if (phone.length != 10) {
    return res.send({
      status: 400,
      message: "Invalid Phone number",
      data: req.body,
    });
  }
  if (grade.length > 1) {
    return res.send({ status: 401, message: "Invalid grade", data: req.body });
  }
  //write into db

  return res.send({
    status: 200,
    message: "Form submitted Successfully",
    data: req.body,
  });
});

app.listen(8000, () => {
  console.log("Listenning on port 8000");
});
