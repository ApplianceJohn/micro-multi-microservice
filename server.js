//require dotenv to grab port
require("dotenv").config();
const express = require("express");
const app = express();

const cors = require("cors");
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
	const date = new Date(request);

	if (!(date instanceof Date) || isNaN(date)) {
		console.error(
			"ERR_INVALID_DATE: The request " +
				request +
				" produced an invalid output of " +
				date +
				"."
		);
		return res.json({ error: "Invalid Date" });
	}

	const unixTime = getUnixTime(request);
	const utcTime = date.toUTCString();
	res.json({ unix: unixTime, utc: utcTime });
});

function getUnixTime(request) {
	console.log("Requesting Unix timestamp...");

	let date = new Date(request);
	console.log("Created date obj " + date);

	if (!unixTest(request)) {
		console.log("Date is UTC, converting to Unix");
		return date.getTime();
	}

	console.log("Date is Unix");
	return request * 1; //a cheap "to int"
}

function unixTest(time) {
	const unixRegex = /[0-9]{1,13}/g;
	return unixRegex.test(time);
}

const listener = app.listen(process.env.PORT, function () {
	console.log("Your app is listening on port " + listener.address().port);
});
