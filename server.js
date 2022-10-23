const { json } = require("express");
const express = require("express");
const app = express();
const fs = require("fs");
const htmlPdf = require("html-pdf");
//converting to array a json doc
//this process is extra , it could be just a array without a doc or with doc
let data_array = [];
const api_keys_doc =fs.readFileSync("api_key.json");
const data = JSON.parse(api_keys_doc);
const data_modify = Object.values(data)[0][0];
const data_values = Object.values(data_modify);
for (var i = 0; i < data_values.length; i++) {
  data_array.push(data_values[i]);
}
//api key controlling
app.post("/",(req, res, next) => {
  const header_api = req.headers["api_key"];
  const width = req.query.width;
  const height = req.query.height;
  let body = [];
  let checked_api_key = data_array.filter((result) => {
    return result.includes(header_api);
  });
  if (checked_api_key.length == 0) {
    res.status(403).json({ error: "invalid api key" });
  } else {
    //receiving html content from postman and texting it inside index.html inside the project
    //this is also extra, it would be just buffer and convert it to pdf
    req
    .on("data", (chunk) => {
      body.push(chunk);
    })
    .on("end", () => {
      body = Buffer.concat(body).toString();
      fs.writeFileSync("index.html", body);
      const html_file = fs.readFileSync("index.html", "utf8");
      //converting
      const options = {
        height: height,
        width: width,
        //render delay as if wish
        //renderDelay: 2000,
      };
        htmlPdf.create(html_file, options).toFile("converted.pdf", (err, result) => {
          if (err) {
            return res.status(500);
          }
          return res.json({ converted_html : result });
        });
      });
  }
});
app.listen(3020, (error) => {
  if (error) {
    console.log(error);
  }
  console.log("connected");
});
