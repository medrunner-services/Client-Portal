import dotenv from 'dotenv';
import fs from 'fs';
import path from "path";
import { pipeline } from 'stream';
import yauzl from 'yauzl';

dotenv.config({ path: '.env.development' });


const downloadLocals = async () => {
	const response = await fetch('https://crowdin.com/api/v2/projects/595793/bundles/7/exports', {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${process.env.CROWDIN_TOKEN}`,
		}
	});

	const parsedResponse = await response.json();

	await new Promise(resolve => setTimeout(resolve, 5000))

	const responseDownload = await fetch(`https://crowdin.com/api/v2/projects/595793/bundles/7/exports/${parsedResponse.data.identifier}/download`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${process.env.CROWDIN_TOKEN}`,
		}
	});

	const parsedResponseDownload = await responseDownload.json();
	const responseFile = await fetch(parsedResponseDownload.data.url)

	await new Promise((resolve, reject) => {
		pipeline(responseFile.body, fs.createWriteStream('src/locales/newLocales.zip'), (err) => {
			if (err) {
				console.log('Error saving: ' + err)
				reject(err);
			} else {
				resolve();
			}
		});
	});

	await new Promise((resolve, reject) => {
		yauzl.open('src/locales/newLocales.zip', {lazyEntries: true}, (err, zipfile) => {
			if (err) {
				console.log('Error extracting: ' + err)
				reject(err);
				return;
			}

			zipfile.readEntry();
			zipfile.on('entry', (entry) => {
				zipfile.openReadStream(entry, (err, readStream) => {
					if (err) {
						reject(err);
						return;
					}

					const filePath = path.join('src/locales', entry.fileName);
					const writeStream = fs.createWriteStream(filePath);
					readStream.pipe(writeStream);

					writeStream.on('close', () => {
						zipfile.readEntry();
					});
				});
			});

			zipfile.on('end', () => {
				resolve();
			});

			zipfile.on('error', (err) => {
				console.log('Error extracting: ' + err)
				reject(err);
			});
		});
	});

	await fs.unlinkSync('src/locales/newLocales.zip')
}

downloadLocals().then(() => console.log('🚀 Done'))