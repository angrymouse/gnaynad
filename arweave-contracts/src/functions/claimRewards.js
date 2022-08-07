module.exports = async function (state, action) {
	let { input, caller } = action;
	let settings = Object.fromEntries(state.settings);

	let nativeRewards = 0;
	state.nodes.forEach((node) => {
		if (!node.active) {
			return;
		}
		if (node.rewardAddress == caller) {
			nativeRewards = parseInt(
				nativeRewards +
					parseInt(
						(SmartWeave.block.height - node.lastClaim) *
							((node.power / settings.averageBlocksPerYear) *
								settings.targetAPR)
					)
			);
			Object.keys(node.externalRewards).forEach((token) => {
				if (state.tokenContracts[token]) {
					state.foreignCalls.push({
						txID: SmartWeave.transaction.id,
						contract: state.tokenContracts[token],
						input: {
							function: "transfer",
							qty: node.externalRewards[token],
							target: caller,
						},
					});
				}
			});
		}
	});
	state.balances[caller] += nativeRewards;
	return { state };
};
