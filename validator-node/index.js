(async () => {
	process.chdir(__dirname);
	let fs = require("fs");
	global.config = require("json5").parse(
		require("fs").readFileSync("./config.json5", "utf8")
	);

	let anchor = await import("@project-serum/anchor");
	const bip39 = require("bip39");
	const bs58 = require("bs58");
	// let anchWallet = anchor.Wallet();

	let solKey = anchor.web3.Keypair.fromSecretKey(
		bs58.decode(fs.readFileSync("./keys/solana.key", "utf8"))
	);
	let SnowflakeSafe = require("@snowflake-so/safe-sdk");

	let anchProvider = new anchor.AnchorProvider(
		new anchor.web3.Connection(config.solanaEndpoint),
		new anchor.Wallet(solKey)
	);

	let snowflakeSafe = new SnowflakeSafe.SnowflakeSafe(anchProvider);

	const safe = await snowflakeSafe.fetchSafe(
		new anchor.web3.PublicKey(config.safeAddress)
	);

	console.log(safe);
})();
