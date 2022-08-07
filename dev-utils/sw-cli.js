#!/usr/bin/env node
const { stdin: input, stdout: output } = require("node:process");
const readline = require("node:readline");
const Arweave = require("arweave");
const { WarpNodeFactory } = require("warp-contracts");
const fs = require("fs");
const path = require("node:path");

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
	let contractAddress = await prompt("Contract address: ");
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
	console.log("Inter input for contract, JSON format. END to finish");
	let input = await multilineJsonPrompt();
	const arweave = Arweave.init({
		host: "arweave.net",
		port: 443,
		protocol: "https",
	});
	const warp = WarpNodeFactory.memCached(arweave);
	let contract = warp.contract(contractAddress).connect(jwk);
	console.log("Submitting interaction...");
	console.log("New state: ", await contract.viewState(input));
	let confirm = await prompt(
		"Confirm and broadcast interaction to arweave mainnet? (Y/N): "
	);
	if (confirm.toLowerCase() === "y") {
		console.log("Interaction tx ID:", await contract.writeInteraction(input));
	} else {
		console.log("Not confirmed. Aborting.");
	}
})();
