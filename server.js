const fs = require("fs");
const parse = require("csv-parse");
const didYouMean = require("didyoumean2").default;
const fetch = require("node-fetch");
const express = require("express");
const datakick = require("datakick");
const app = express();

// CORS
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

app.get("/", (req, res) => {
	res.send("Welcome to the chno API");
});

let csvData = [];
fs.createReadStream("caffeine.csv")
	.pipe(parse({ delimiter: "," }))
	.on("data", csvRow => {
		csvData.push({
			name: csvRow[0],
			volume: csvRow[1],
			caffeine: csvRow[2],
			density: csvRow[3]
		});
	})
	.on("end", () => {
		app.get("/:barcode", (req, res) => {
			datakick
				.item(req.params.barcode)
				.then(function(data) {
					if (data.message !== "Item not found") {
						const query = data.brand_name + " " + data.name;
						arrayOfNames = csvData.map(item => item.name);
						let correctedQuery = didYouMean(query, arrayOfNames);
						let index = arrayOfNames.indexOf(correctedQuery);
						res.send(csvData[index]);
					} else {
						res.send({
							error: "Item not found"
						});
					}
				})
				.catch(function(error) {
					res.send({
						error: "Item not found"
					});
				});
		});
	});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`chno listening on port ${port}`));
