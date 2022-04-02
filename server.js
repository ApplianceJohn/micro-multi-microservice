//require dotenv to grab port
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

//mongoose init
mongoose.connect(
	`mongodb+srv://bdiamond:${process.env.MDB_PASS}@micro-multi-microservic.8nll3.mongodb.net/micro-multi-microservice?retryWrites=true&w=majority`,
	{ useNewUrlParser: true }
);

//connect to mongodb database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
	console.log("Connected successfully");
});

//instantiate URL model
const urlSchema = new mongoose.Schema({
	original_url: String,
	short_url: Number,
});

const URL = mongoose.model("URL", urlSchema);

//body-parser init
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// http://expressjs.com/en/starter/static-files.html
app.use("/css", express.static(`${__dirname}/node_modules/bootstrap/dist/css`));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
	res.sendFile(`${__dirname}/views/index.html`);
});

//? time microservice null handler

app.get("/api/", (req, res) => {
	console.log("No time provided to API, returning current time obj");
	const today = new Date();
	const unixToday = today.getTime();
	const utcToday = today.toUTCString();

	res.json({ unix: unixToday, utc: utcToday });
});

//? whoami header parser

app.get("/api/whoami", (req, res) => {
	res.json({
		ipaddress: req.headers.host,
		language: req.headers["accept-language"],
		software: req.headers["user-agent"],
	});
});

//? url shortener microservice

function checkIfUrlExists(url) {
	return new Promise((pass, fail) => {
		URL.findOne({ original_url: url }, (err, doc) => {
			if (err) return fail(err);
			return pass(doc);
		});
	});
}

function getNextUrlIndex() {
	return new Promise((pass, fail) => {
		URL.findOne()
			.sort({ short_url: -1 })
			.exec((err, url) => {
				if (err) return fail(err);
				return pass(url.short_url + 1);
			});
	});
}

app.post("/api/shorturl", async (req, res) => {
	const originalUrl = req.body["short-url"];
	let index = 0;

	await checkIfUrlExists(originalUrl)
		.then((doc) => {
			if (doc)
				return res.json({
					original_url: doc.original_url,
					short_url: doc.short_url,
				});
		})
		.catch((err) => {
			return res.send(err);
		});

	await getNextUrlIndex()
		.then((value) => {
			index = value;
		})
		.catch((err) => {
			return res.send(err);
		});

	const url = new URL({
		original_url: originalUrl,
		short_url: index,
	});

	url.save().then((doc) => {
		return res.json({
			original_url: doc.original_url,
			short_url: doc.short_url,
		});
	});

	//! don't delete regex code!!
	/* const urlRegex = /(https?:\/\/)?(www.)?\w+\.\w+\/?/g;
		const responseJSON = urlRegex.test(req.body["short-url"])
			? {
					original_url: req.body["short-url"],
					short_url: 0,
			  }
			: { error: "invalid url" };
	
		res.json(responseJSON);*/
});

//TODO: find out how to properly set Mongoose ID
app.get("/api/shorturl/:short", (req, res) => {
	console.log(`loading requested url with id ${req.params.short}`);
	const shortUrl = req.params.short;
	URL.findOne({ short_url: shortUrl }).then((doc) => {
		console.log(`redirecting to ${doc.original_url}`);
		res.redirect(doc.original_url);
	});
});

//? timestamp microservice

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

//? timestamp supporting functions
//? *******************************

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

//? *******************************
//? end timestamp functions

const listener = app.listen(process.env.PORT, function () {
	console.log(`Your app is listening on port ${listener.address().port}`);
});
