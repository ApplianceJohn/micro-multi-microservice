// server.js
// where your node app starts
require("dotenv").config();

// init project
var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/", (req, res) => {
  const today = new Date();
  const unixToday = today.getTime();
  const utcToday = today.toUTCString();

  res.json({ unix: unixToday, utc: utcToday });
});

app.get("/api/:time", (req, res) => {
  const request = req.params.time;
  const truth = new Date(request);

  if (!truth.getTime()) {
    return res.json({ error: "Invalid Date" });
  }

  const time = (() => {
    if (!isUnix(request)) {
      return Math.floor(new Date(request).getTime());
    }
    return request * 1;
  })();

  const utcTime = new Date(time).toUTCString();
  res.json({ unix: time, utc: utcTime });
});

const isUnix = (time) => {
  const unixRegex = /[0-9]{13}/g;
  return unixRegex.test(time);
};

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
