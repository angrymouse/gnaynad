module.exports = async (state, action) => {
	let result = state.nodes.filter((node) => node.active);
	return { result: result };
};
