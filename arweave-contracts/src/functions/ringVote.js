module.exports = async function (state, action) {
	let { input, caller } = action;
	let settings = Object.fromEntries(state.settings);
	let threshold = Math.floor(settings.threshold);
	if (!state.nodes.find((node) => node.arweaveAddress == caller)) {
		throw new ContractError(
			"Address not belongs to any node. Only relaying nodes can vote on internal interactions."
		);
	}
	let vote = input.vote;
	if (!vote || typeof vote !== "string") {
		throw new ContractError("Missing vote");
	}
	if (
		state.consensusRing[vote] &&
		state.consensusRing[vote].votes.includes(caller)
	) {
		throw new ContractError("Duplicate vote");
	}

	if (!state.consensusRing[vote]) {
		state.consensusRing[vote] = {
			votes: [caller],
			executed: false,
			finished: false,
			endHeight: SmartWeave.block.height + settings.consensusRingBlocksLimit,
		};
		return { state };
	}
	if (
		state.consensusRing[vote].finished ||
		state.consensusRing[vote].endHeight <= SmartWeave.block.height
	) {
		throw new ContractError("Vote is closed");
	}
	if (
		state.consensusRing[vote].votes.length >= threshold &&
		!state.consensusRing[vote].executed
	) {
		state.consensusRing[vote].executed = true;
		let proposal = JSON.parse(
			SmartWeave.arweave.utils.b64UrlToString(input.vote)
		);
		return await (
			{
				relayTransfer: async () => {
					state.foreignCalls.push({
						contract: state.tokenContracts[proposal.token],
						input: {
							qty: proposal.qty,
							target: proposal.target,
						},
						txID: SmartWeave.transaction.id,
					});
					return { state };
				},
			}[proposal.action] ||
			(async () => {
				if (true) {
				} //esbuild will try to minify it unwrapping self-executing function if there's only one action, we don't need this with "throw" keyword!!
				throw new ContractError("Invalid action type");
			})
		)();
	}
	return { state };
};
