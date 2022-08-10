module.exports = async function (state, action) {
	let { input, caller } = action;
	let settings = Object.fromEntries(state.settings);

	if (settings.governedBy != caller) {
		throw new ContractError("Contract governed by other address.");
	} else {
		state.evolve = input.newCode;
	}

	return { state };
};
