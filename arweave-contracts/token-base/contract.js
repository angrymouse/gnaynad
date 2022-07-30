export async function handle(state, action) {
	let { input, caller } = action;

	if (
		!input ||
		typeof input !== "object" ||
		!input.function ||
		typeof input.function !== "string"
	) {
		throw new ContractError("No function");
	}

	return await (
		{
			balance: require("./functions/balance.js"),
			transfer: require("./functions/transfer.js"),
			readOutbox: require("./functions/readOutbox.js"),
			setPuppeteer: require("./functions/setPuppeteer.js"),
		}[input.function] ||
		(async () => {
			if (true) {
			} //esbuild will try to minify it unwrapping self-executing function if there's only one action, we don't need this with "throw" keyword!!
			throw new ContractError("Invalid function");
		})
	)(state, action);
}
