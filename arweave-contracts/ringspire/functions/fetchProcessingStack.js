module.exports = async function (state, action) {
	let { input, caller } = action;

	let result = state.processingStack.filter((item) => {
		return item.blockHeight >= SmartWeave.block.height - input.blockMargin;
	});
	return { result };
};
