import express from 'express';
import yargs from "yargs";
import path from 'path';
import { fileURLToPath } from 'url';

import SessionManager from "./sessionManager.js";
import api from './api.js';

export const argv = yargs(process.argv)
	.option("prod", {
		alias: "p",
		description: "Run in production mode",
		type: "boolean",
		default: false,
	})
	.help()
	.alias("help", "h").argv;

import config from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const sessionManager = new SessionManager(config);

const app = express();

app.use('/api', api);

if (argv.prod) {
	app.use("/", express.static("../frontend/dist"));
	app.use((req, res) => {
		res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
	});
}

app.listen(config.port, () => {
    console.log("listening on " + config.port);
});