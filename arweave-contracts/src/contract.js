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
			registerNode: require("./functions/registerNode.js"),
		}[input.function] ||
		(() => {
			throw new ContractError("Invalid function");
		})
	)(state, action);
}
