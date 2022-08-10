module.exports = async function (state, action) {
	let { input, caller } = action;
	let settings = Object.fromEntries(state.settings);

	let fixedFee = settings.processingStackAdditionFee;
	if (!state.balances[caller] || state.balances[caller] < fixedFee) {
		throw new ContractError(
			`Not enough funds to put transaction to processing stack. ${
				fixedFee / state.divisibility
			} ${state.ticker} required.`
		);
	}
	state.balances[caller] -= fixedFee;

	if (!input.signature || !input.pubkey || !input.network || !input.txId) {
		throw new ContractError(
			`Missing required fields in input: ${
				input.signature ? "" : "signature, "
			} ${input.pubkey ? "" : "pubkey, "} ${input.network ? "" : "network, "} ${
				input.txId ? "" : "txId"
			}`
		);
	}
	state.processingStack.push({
		signature: input.signature,
		pubkey: input.pubkey,
		network: input.network,
		txId: input.txId,
		dataToSign:
			caller.toString() +
			input.pubkey.toString() +
			input.network.toString() +
			input.txId.toString(),
		blockHeight: SmartWeave.block.height,
		id: SmartWeave.transaction.id,
		claimer: caller,
	});
	return { state };
};
