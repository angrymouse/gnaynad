module.exports = async function (state, action) {
	let { input, caller } = action;
	let settings = Object.fromEntries(state.settings);
	if (!state.nodes.find((node) => node.arweaveAddress == caller)) {
		throw new ContractError(
			"Address not belongs to any node. Only relaying nodes can propose internal interactions."
		);
	}
	if (
		!input.actionType ||
		!input.details ||
		typeof input.details !== "object" ||
		typeof input.actionType !== "string"
	) {
		throw new ContractError("Missing actionType or details");
	}
	return await (
		{
			relayTransfer: async () => {
				if (
					!details.network ||
					!state.supportedNetworks.includes(details.network)
				) {
					throw new ContractError("Invalid network");
				}
				if (
					!details.transactionId ||
					typeof details.transactionId !== "string"
				) {
					throw new ContractError("Invalid transaction ID");
				}
				if (
					!details.serializedInfo ||
					typeof details.serializedInfo !== "string"
				) {
					throw new ContractError("Invalid transaction info");
				}
				state.internalProposals.push({
					actionType: "relayTransfer",
					proposer: caller,
					completed: false,
					network: details.network,
					transactionId: details.transactionId,
					votes: {
						[details.serializedInfo]: [caller],
					},
				});
				return { state };
			},
		}[input.actionType] ||
		(async () => {
			if (true) {
			} //esbuild will try to minify it unwrapping self-executing function if there's only one action, we don't need this with "throw" keyword!!
			throw new ContractError("Invalid action type");
		})
	)(state, action);
};
