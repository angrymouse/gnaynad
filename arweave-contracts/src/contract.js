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
	let activeNodes = [];
	state.nodes.forEach((node, index) => {
		node.index = index;
		if (node.active) {
			activeNodes.push(node);
		}
	});
	Object.entries(state.consensusRing).forEach(([vote, meta]) => {
		if (meta.endHeight <= SmartWeave.block.height) {
			state.consensusRing[vote].finished = true;
		}
	});
	let executedUnfinishedConsensusRing = Object.entries(
		state.consensusRing
	).filter(([vote, meta]) => {
		return !meta.finished && meta.executed; // We will punish nodes that didn't vote like mojority did
	});
	let unexecutedFinishedConsensusRing = Object.entries(
		state.consensusRing
	).filter(([vote, meta]) => {
		return meta.finished && !meta.executed; // And we will punish nodes that voted on vote where majority didn't (probably they voted on incorrect info)
	});
	activeNodes.forEach((node) => {
		executedUnfinishedConsensusRing.forEach(([vote, meta]) => {
			if (!meta.votes.includes(node.arweaveAddress)) {
				if (node.active) {
					node.active = false;
					node.power *= 1 - state.settings.downtimeSlashingPower;
					state.threshold -= state.settings.thresholdChange;
					let index = node.index;
					delete node.index;
					state.nodes[index] = node;
				}
			}
		});
		unexecutedFinishedConsensusRing.forEach(([vote, meta]) => {
			if (meta.votes.includes(node.arweaveAddress)) {
				if (node.active) {
					node.active = false;
					node.power *= 1 - state.settings.falseVoteSlashingPower;
					state.threshold -= state.settings.thresholdChange;
					let index = node.index;
					delete node.index;
					state.nodes[index] = node;
				}
			}
		});
	});

	return await (
		{
			balance: require("./functions/balance.js"),
			transfer: require("./functions/transfer.js"),
			readOutbox: require("./functions/readOutbox.js"),
			registerNode: require("./functions/registerNode.js"),
			claimRewards: require("./functions/claimRewards.js"),
			ringVote: require("./functions/ringVote.js"),
			evolve: require("./functions/evolve.js"),
			getNodes: require("./functions/getNodes.js"),
		}[input.function] ||
		(async () => {
			if (true) {
			} //esbuild will try to minify it unwrapping self-executing function if there's only one action, we don't need this with "throw" keyword!!
			throw new ContractError("Invalid function");
		})
	)(state, action);
}
