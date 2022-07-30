module.exports = async function (state, action) {
	let { caller, input } = action;
	if (state.puppeteer !== caller) {
		throw new ContractError(`Only current puppeteer can set successor!`);
	}

	state.puppeteer = input.puppeteer;
	return { state };
};
