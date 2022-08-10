(async () => {
	const anchor = await import("@project-serum/anchor");
	const bs58 = require("bs58");
	const fs = require("fs");
	const nacl = require("tweetnacl");
	let solKey = anchor.web3.Keypair.fromSecretKey(
		bs58.decode(fs.readFileSync("./keys/solana.key", "utf8"))
	);
	console.log(bs58.encode(solKey.publicKey.toBytes()));
	const messageBytes = new Uint8Array(
		Buffer.from(
			`udOL7D7qkfFyfnkxfRQA0r1Eoz1-XRwUOSLfiCFee38DofXHUWDUBpnTx8tKt4evyDbGfAo9jjgeThCSETgVTPVsolana39tDwTwXtPei4TFAP5P6CS7pLrnJraLvwQynsS7RhMLcaJCbSvg4xKsiZz6udsA7CZTreqR4Afbf7QCePezsMXWV`
		)
	);

	const signature = nacl.sign.detached(messageBytes, solKey.secretKey);
	console.log(bs58.encode(signature));
})();
