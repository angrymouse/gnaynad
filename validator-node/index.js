const Arweave = require("arweave");
const { WarpNodeFactory } = require("warp-contracts");
const bip39 = require("bip39");
const bs58 = require("bs58");
const nacl = require("tweetnacl");
const { Level } = require("level");
(async () => {
	const anchor = await import("@project-serum/anchor");
	process.chdir(__dirname);
	let fs = require("fs");
	global.config = require("json5").parse(
		require("fs").readFileSync("./config.json5", "utf8")
	);
	global.processedStack = new Set();
	global.lData = new Level("local-data", { valueEncoding: "json" });

	let solKey = anchor.web3.Keypair.fromSecretKey(
		bs58.decode(fs.readFileSync("./keys/solana.key", "utf8"))
	);
	let arKey = require("./keys/arweave.json");
	// let anchWallet = anchor.Wallet();

	const arweave = Arweave.init({
		host: "arweave.dev",
		port: 443,
		protocol: "https",
	});
	const warp = WarpNodeFactory.fileCached(arweave, "./warp-contracts-cache", 8);
	let ringspire = warp.contract(config.ringspireContract).connect(arKey);
	let SnowflakeSafe = require("@snowflake-so/safe-sdk");

	let anchProvider = new anchor.AnchorProvider(
		new anchor.web3.Connection(config.solanaEndpoint),
		new anchor.Wallet(solKey)
	);

	let snowflakeSafe = new SnowflakeSafe.SnowflakeSafe(anchProvider);

	const safe = await snowflakeSafe.fetchSafe(
		new anchor.web3.PublicKey(
			(
				await ringspire.readState()
			).state.multisigs.solana.managingContract
		)
	);

	setInterval(
		() =>
			require("./clock/checkProcessingStack")({
				ringspire,
				anchor: anchProvider,
			}),
		config.checkInterval
	);
	// console.log(tx);
	// const message = "The quick brown fox jumps over the lazy dog";
	// const messageBytes = new Uint8Array(Buffer.from(message));

	// const signature = nacl.sign.detached(messageBytes, solKey.secretKey);
	// console.log(signature);

	// const result = nacl.sign.detached.verify(
	// 	new Uint8Array(),
	// 	signature,
	// 	solKey.publicKey.toBytes()
	// );

	// console.log(result);
	// console.log(nacl);
})();
