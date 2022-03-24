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
	res.sendFile(`${__dirname}/views/index.html`);
});

app.get("/api/", (req, res) => {
	console.log("No time provided to API, returning current time obj");
	const today = new Date();
	const unixToday = today.getTime();
	const utcToday = today.toUTCString();

	res.json({ unix: unixToday, utc: utcToday });
});

app.get("/api/:time", (req, res) => {
	const request = req.params.time;
	console.log(`Initial request param: ${request}`);

	const unix = getCompatibleUnixTime(request);
	console.log(`Unix time: ${unix.time}\nSource: ${unix.source}`);

	const date = new Date(unix.time);

	if (!(date instanceof Date) || isNaN(date)) {
		console.error(
			`ERR_INVALID_DATE: The request "${request}" produced an invalid date output.`
		);
		return res.json({ error: "Invalid Date" });
	}

	const utc = date.toUTCString();
	const timeObj = { unix: unix.time, utc: utc };
	console.log(`Returning JSON:\n${JSON.stringify(timeObj)}`);
	res.json(timeObj);
});

function getCompatibleUnixTime(request) {
	console.log("Requesting Unix timestamp...");

	if (!unixTest(request)) {
		console.log("Date is UTC, converting to Unix");
		return { time: new Date(request).getTime(), source: "utc" };
	}

	console.log("Date is Unix");
	return { time: request * 1, source: "unix" }; //a cheap "to int"
}

function unixTest(time) {
	const unixRegex = /^\d+$/g;
	return unixRegex.test(time);
}

const listener = app.listen(process.env.PORT, function () {
	console.log(`Your app is listening on port ${listener.address().port}`);
});
