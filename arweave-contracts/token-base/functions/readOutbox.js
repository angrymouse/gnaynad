module.exports = async function (state, action) {
	let { caller, input } = action;

	// Ensure that a contract ID is passed
	ContractAssert(!!input.contract, "Missing contract to invoke");

	// Read the state of the foreign contract
	const foreignState = await SmartWeave.contracts.readContractState(
		input.contract
	);

	// Check if the foreign contract supports the foreign call protocol and compatible with the call
	ContractAssert(
		!!foreignState.foreignCalls,
		"Contract is missing support for foreign calls"
	);

	// Get foreign calls for this contract that have not been executed
	const calls = foreignState.foreignCalls.filter(
		(element) =>
			element.contract === SmartWeave.contract.id &&
			!state.invocations.includes(element.txID)
	);

	// Run all invocations
	let res = state;

	for (const entry of calls) {
		// Run invocation
		res =
			(
				await eval("handle")(res, {
					// esbuild wants to rewrite main handle function because of calling handle directly, and keepNames not works properly, so we use eval to disable "optimization"
					caller: input.contract,
					input: entry.input,
				})
			).state || state;
		// Push invocation to executed invocations
		res.invocations.push(entry.txID);
	}

	return {
		state: res,
	};
};
