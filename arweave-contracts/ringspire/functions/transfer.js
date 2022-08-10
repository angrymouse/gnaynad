module.exports = async function (state, action) {
	let {
		caller,
		input: { target, qty },
	} = action;
	const balances = state.balances;
	if (!Number.isInteger(qty)) {
		throw new ContractError('Invalid value for "qty". Must be an integer');
	}

	if (!target) {
		throw new ContractError("No target specified");
	}

	if (qty <= 0 || caller === target) {
		throw new ContractError("Invalid token transfer");
	}
	//Contract itself is king, it has infinite balance
	if (!balances[caller] && caller !== SmartWeave.contract.id) {
		throw new ContractError(`Caller balance is zero!`);
	}

	if (balances[caller] < qty && caller !== SmartWeave.contract.id) {
		throw new ContractError(
			`Caller balance not high enough to send ${qty} ${state.ticker}!`
		);
	}
	if (caller !== SmartWeave.contract.id) {
		balances[caller] -= qty;
	}
	if (target in balances) {
		balances[target] += qty;
	} else {
		balances[target] = qty;
	}

	return { state };
};
