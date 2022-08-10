const bs58 = require("bs58");
const nacl = require("tweetnacl");
module.exports = async function ({ ringspire, anchor }) {
	let activeRingState = await ringspire.viewState({
		function: "fetchProcessingStack",
		blockMargin: 1000,
	});

	let activeStack = activeRingState.result;
	activeStack.forEach(async (item) => {
		if (processedStack.has(item.id)) {
			return;
		}
		let signature = bs58.decode(item.signature);
		let pubkey = bs58.decode(item.pubkey);
		let network = item.network;
		let txId = item.txId;
		let dataToSign = new Uint8Array(Buffer.from(item.dataToSign));
		let signatureValid;
		processedStack.add(item.id);
		try {
			signatureValid = await nacl.sign.detached.verify(
				dataToSign,
				signature,
				pubkey
			);
		} catch (e) {
			signatureValid = false;
		}

		if (!signatureValid) {
			return;
		}
		if (activeRingState.state.processedTransactions.includes(item.txId)) {
			return;
		}

		let tx = await anchor.connection.getParsedTransaction(txId);
		if (!tx || tx.transaction.message.instructions.length !== 1) {
			console.log(tx.transaction.message.instructions.length);
			return;
		}
		let instruction = tx.transaction.message.instructions[0];
		if (
			instruction.program !== "system" ||
			instruction.parsed.type !== "transfer" ||
			instruction.parsed.info.destination !==
				activeRingState.state.multisigs.solana.address ||
			instruction.parsed.info.source !== item.pubkey ||
			!instruction.parsed.info.lamports
		) {
			return;
		}
		let amountInLamports = instruction.parsed.info.lamports;

		console.log(
			`${instruction.parsed.info.source} (solana) deposited ${
				amountInLamports / 1000000000
			} SOL to ${item.claimer} (arweave)`
		);
	});
	return;
};
