const Arweave = require("arweave");
const { WarpNodeFactory } = require("warp-contracts");
const bip39 = require("bip39");
const bs58 = require("bs58");

(async () => {
	const splMemo = await import("@solana/spl-memo");
	console.log(splMemo);
	const anchor = await import("@project-serum/anchor");
	process.chdir(__dirname);
	let fs = require("fs");
	global.config = require("json5").parse(
		require("fs").readFileSync("./config.json5", "utf8")
	);
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
	const warp = WarpNodeFactory.memCached(arweave);
	let ringspire = warp.contract(config.ringspireContract).connect(arKey);
	let SnowflakeSafe = require("@snowflake-so/safe-sdk");

	let anchProvider = new anchor.AnchorProvider(
		new anchor.web3.Connection(config.solanaEndpoint),
		new anchor.Wallet(solKey)
	);

	let snowflakeSafe = new SnowflakeSafe.SnowflakeSafe(anchProvider);

	const safe = await snowflakeSafe.fetchSafe(
		new anchor.web3.PublicKey((await ringspire.readState()).state.solanaSafe)
	);

	console.log(
		await snowflakeSafe.fetchAllProposals(
			new anchor.web3.PublicKey((await ringspire.readState()).state.solanaSafe)
		)
	);
})();
