/* eslint no-console: "off" */

import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import dotenv from "dotenv";
import yauzl from "yauzl";

dotenv.config({ path: ".env.development" });

async function downloadLocals() {
	console.log("📦 Generating bundle...");
	let responseBundle;
	let responseDownload;
	try {
		responseBundle = await fetch("https://medrunner.crowdin.com/api/v2/projects/2/bundles/6/exports", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				// eslint-disable-next-line node/prefer-global/process -- Global rule not working for some reason
				"Authorization": `Bearer ${process.env.CROWDIN_TOKEN}`,
			},
		});
	}
	catch (e) {
		console.log("❌ Error generating bundle");
		throw new Error(e);
	}

	const parsedResponse = await responseBundle.json();

	await new Promise(resolve => setTimeout(resolve, 5000));

	try {
		console.log("🛜 Downloading translations...");
		responseDownload = await fetch(
			`https://medrunner.crowdin.com/api/v2/projects/2/bundles/6/exports/${parsedResponse.data.identifier}/download`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					// eslint-disable-next-line node/prefer-global/process -- Global rule not working for some reason
					"Authorization": `Bearer ${process.env.CROWDIN_TOKEN}`,
				},
			},
		);
	}
	catch (e) {
		console.log("❌ Error downloading translations");
		throw new Error(e);
	}

	const parsedResponseDownload = await responseDownload.json();
	const responseFile = await fetch(parsedResponseDownload.data.url);

	await new Promise((resolve, reject) => {
		console.log("💾 Saving translations...");
		pipeline(responseFile.body, fs.createWriteStream("src/locales/newLocales.zip"), (err) => {
			if (err) {
				console.log("❌ Error saving");
				reject(err);
			}
			else {
				resolve();
			}
		});
	});

	await new Promise((resolve, reject) => {
		console.log("⛏️ Extracting translations...");
		yauzl.open("src/locales/newLocales.zip", { lazyEntries: true }, (err, zipfile) => {
			if (err) {
				console.log("❌ Error extracting");
				reject(err);
				return;
			}

			zipfile.readEntry();
			zipfile.on("entry", (entry) => {
				zipfile.openReadStream(entry, (err, readStream) => {
					if (err) {
						reject(err);
						return;
					}

					const filePath = path.join("src/locales", entry.fileName);
					const writeStream = fs.createWriteStream(filePath);
					readStream.pipe(writeStream);

					writeStream.on("close", () => {
						zipfile.readEntry();
					});
				});
			});

			zipfile.on("end", () => {
				resolve();
			});

			zipfile.on("error", (err) => {
				console.log("❌ Error extracting");
				reject(err);
			});
		});
	});

	await fs.unlinkSync("src/locales/newLocales.zip");
}

downloadLocals().then(() => console.log("🚀 Done!"));
