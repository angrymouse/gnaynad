#!/usr/bin/env node
const { stdin: input, stdout: output } = require("node:process");
const readline = require("node:readline");
const Arweave = require("arweave");
const { build } = require("esbuild");
const { WarpNodeFactory } = require("warp-contracts");
const fs = require("fs");
const path = require("node:path");
let JSON5 = require("json5");

global.prompt = function (question) {
	return new Promise((resolve) => {
		const rl = readline.createInterface({ input, output });
		rl.question(question, (answ) => {
			rl.close();
			resolve(answ);
		});
	});
};
global.multilineJsonPrompt = async function multilineJsonPrompt() {
	let accumulated = "";
	async function inheritedRecursive() {
		let lineContent = await prompt("");
		if (lineContent.toLowerCase() !== "end") {
			accumulated += lineContent;
			return await inheritedRecursive();
		} else {
			return accumulated;
		}
	}
	return JSON.parse(await inheritedRecursive());
};
(async () => {
	let jwk = JSON.parse(
		fs.readFileSync(
			path.join(
				process.cwd(),
				fs.existsSync("./.secrets/jwk.json")
					? "./.secrets/jwk.json"
					: await prompt("Path to JWK file: ")
			),
			"utf8"
		)
	);
	let folder = await prompt("Folder with contracts to deploy: ");
	process.chdir(path.join(process.cwd(), folder));
	let initState = JSON5.parse(fs.readFileSync("./init.json5", "utf8"));
	console.log("BUIDLing contract...");
	let buildResult = await build({
		entryPoints: [path.join(process.cwd(), "contract.js")],
		outdir: "./dist",
		minify: false,
		write: false,
		bundle: true,
		format: "iife",
	});
	let code = Buffer.from(buildResult.outputFiles[0].contents)
		.toString("utf8")
		.slice(8, -6);
	console.log("Built contract!");

	const arweave = Arweave.init({
		host: "arweave.dev",
		port: 443,
		protocol: "https",
	});
	const warp = WarpNodeFactory.memCached(arweave);
	const deployed = await warp.createContract.deploy({
		wallet: jwk,
		initState: JSON.stringify(initState),
		src: code,
	});
	console.log("Deployed contract!");
	console.log(" ");
	console.log("Contract address:", deployed.contractTxId);
	console.log(" ");
	console.log("Source address:", deployed.srcTxId);
})();
