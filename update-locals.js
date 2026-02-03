/* eslint no-console: "off" */
/* eslint node/prefer-global/process: "off" */

import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import dotenv from "dotenv";
import yauzl from "yauzl";

dotenv.config({ path: ".env.development" });

async function downloadLocals() {
    let responseBundle;
    let responseDownload;
    let languagesStats;

    try {
        console.log("📦 Generating bundle...");
        responseBundle = await fetch("https://medrunner.crowdin.com/api/v2/projects/2/bundles/6/exports", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.CROWDIN_TOKEN}`,
            },
        });
    }
    catch (e) {
        console.log("❌ Error generating bundle");
        throw new Error(e);
    }

    const parsedResponse = await responseBundle.json();

    try {
        console.log("📊 Downloading languages stats...");
        const response = await fetch("https://medrunner.crowdin.com/api/v2/projects/2/languages/progress?limit=50", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.CROWDIN_TOKEN}`,
            },
        });

        languagesStats = await response.json();
    }
    catch (e) {
        console.log("❌ Error downloading languages stats");
        console.log(JSON.stringify(e));
    }

    console.log("⏳ Waiting for 5 seconds for Crowdin servers...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
        console.log("🛜 Downloading translations...");
        responseDownload = await fetch(
            `https://medrunner.crowdin.com/api/v2/projects/2/bundles/6/exports/${parsedResponse.data.identifier}/download`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
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

    fs.unlinkSync("src/locales/newLocales.zip");

    console.log("🗑 Removing unfinished translations...");
    languagesStats.data.forEach((language) => {
        if (language.data.translationProgress < (process.env.INCOMPLETE_TRANSLATION_THRESHOLD && 75) && language.data.language.locale !== "en-US") {
            console.log(`   🚮 Removing ${language.data.language.name} translation!`);
            fs.unlinkSync(path.join(`src/locales/${language.data.language.locale}.json`));
        }
    });

    const tableData = languagesStats.data
        .sort((a, b) => b.data.translationProgress - a.data.translationProgress)
        .map(language => ({
            "Language": language.data.language.name,
            "Locale": language.data.language.locale,
            "Translation %": `${language.data.translationProgress}%`,
            "Status": language.data.translationProgress < (process.env.INCOMPLETE_TRANSLATION_THRESHOLD && 75) ? "❌" : language.data.translationProgress < 90 ? "⚠️" : language.data.translationProgress < 95 ? "🆗" : "✅",
        }));

    console.table(tableData);
}

downloadLocals().then(() => console.log("🚀 Done!"));
