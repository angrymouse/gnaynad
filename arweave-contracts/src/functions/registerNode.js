module.exports = async function (state, action) {
	let { caller, input } = action;
	let settings = Object.fromEntries(state.settings);
	if (
		!state.balances[caller] ||
		state.balances[caller] <= settings.nodeRegistrationFee
	) {
		throw new ContractError("Insufficient balance to register node");
	}

	if (!input.info) {
		throw new ContractError("No info provided");
	}
	input.info.name = input.info.name || "[No name]";
	input.info.website = input.info.website || "[No website]";
	if (
		!input.info.arweaveAddress ||
		state.nodes.find((node) => node.arweaveAddress == input.info.arweaveAddress)
	) {
		throw new ContractError(
			"No arweave address provided or address already registered"
		);
	}

	if (
		!input.info.solanaAddress ||
		state.nodes.find((node) => node.solanaAddress == input.info.solanaAddress)
	) {
		throw new ContractError(
			"No solana address provided or address already registered"
		);
	}
	input.info.rewardAddress =
		input.info.rewardAddress || input.info.arweaveAddress;
	state.nodes.push({
		name: input.info.name,
		website: input.info.website,
		arweaveAddress: input.info.arweaveAddress,
		rewardAddress: input.info.rewardAddress,
		solanaAddress: input.info.solanaAddress,
		active: true,
	});
	if (!state.rewards[input.info.rewardAddress]) {
		state.rewards[input.info.rewardAddress] = { SOL: 0 };
	}
	state.balances[caller] -= settings.nodeRegistrationFee;

	return { state };
};
