const fs = require("fs");
const http = require("http");
const formidable = require("formidable");
const server = http.createServer();

// server.on("request", (req, res) => {
//   //   console.log(req.method, " ", req.url);

//   //   res.end("welcome");

//   if (req.method === "GET" && req.url === "/") {
//     fs.readFile("demo.txt", (err, data) => {
//       console.log(data);
//       res.write(data);
//       return res.end();
//     });
//   } else if (req.method === "GET" && req.url === "/append") {
//     //append using new file and in existing file

//     fs.appendFile("demo.txt", "Hello content!", function (err) {
//       if (err) throw err;
//       console.log("Saved!");
//       return res.end("Appended");
//     });
//   } else if (req.method === "GET" && req.url === "/writefile") {
//     fs.writeFile("mynewfile1.txt", "This is my text", function (err) {
//       if (err) throw err;
//       console.log("Replaced!");
//       return res.end("Updated");
//     });
//   } else if (req.method === "GET" && req.url === "/deletefile") {
//     fs.unlink("mynewfile2.txt", function (err) {
//       if (err) throw err;
//       console.log("File deleted!");
//       return res.end("Deleted");
//     });
//   } else if (req.method === "GET" && req.url === "/renamefile") {
//     fs.rename("mynewfile1.txt", "myrenamedfile.txt", function (err) {
//       if (err) throw err;
//       console.log("File Renamed!");
//       return res.end("Renamed");
//     });
//   } else {
//     return res.end("PAGE NOT FOUND");
//   }
// });

server.on("request", (req, res) => {
  const rStrem = fs.createReadStream("demo.txt");

  rStrem.on("data", (char) => {
    console.log(char);
    res.write(char);
  });

  rStrem.on("end", () => {
    res.end();
  });
});

server.listen(8000);

// http
//   .createServer(function (req, res) {
//     if (req.url == "/fileupload") {
//       var form = new formidable.IncomingForm();
//       form.parse(req, function (err, fields, files) {
//         var oldpath = files.filetoupload.filepath;
//         var newpath =
//           __dirname + "/uploads/" + files.filetoupload.originalFilename;
//         fs.rename(oldpath, newpath, function (err) {
//           if (err) throw err;
//           res.write("File uploaded and moved!");
//           res.end();
//         });
//       });
//     } else {
//       res.writeHead(200, { "Content-Type": "text/html" });
//       res.write(
//         '<form action="fileupload" method="post" enctype="multipart/form-data">'
//       );
//       res.write('<input type="file" name="filetoupload"><br>');
//       res.write('<input type="submit">');
//       res.write("</form>");
//       return res.end();
//     }
//   })
//   .listen(8000);
