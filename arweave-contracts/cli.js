#!/usr/bin/env node
const readline = require('node:readline');
const util=require("node:util")
const { stdin: input, stdout: output } = require('node:process');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const Arweave = require("arweave");

global.prompt=function (question){
   
    return new Promise((resolve)=>{
        const rl = readline.createInterface({ input, output });
        rl.question(question,(answ)=>{rl.close();resolve(answ)})

    })
    
};
global.multilineJsonPrompt=async function multilineJsonPrompt(){
    let accumulated=""
    async function inheritedRecursive(){
        let lineContent=await prompt("")
        if(lineContent.toLowerCase()!=="end"){
            accumulated+=lineContent
            return await inheritedRecursive()
        }else{
            return accumulated
        }
    }
    return JSON.parse(await inheritedRecursive())
};
(async ()=>{
    global.chalk=(await import("chalk")).default;
    const arweave = Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
      });
    console.log(chalk.bgGreen.black(" Welcome to SmartWeave FCP Multisig manager! "))
    console.log("")
    console.log(chalk.bgGreen.black(" Please provide your JWK key "))
    let jwk=JSON.parse(readFileSync(path.normalize(await prompt("Enter path to JWK:")),"utf8"))
    console.log(`Logged in as ${chalk.yellow(await arweave.wallets.getAddress(jwk))}`)
    // Here I could steal your key. ALWAYS CHECK THE CODE OF PROJECTS WHERE YOU ENTER PRIVATE KEYS!!! :)
    menu(jwk)
})();
async function menu(jwk){
 
    console.log(chalk.bgBlue(" --- SELECT OPTION --- "))
    console.log("")
    console.log(chalk.bgBlue(" 1. Create new multisig "))
    console.log(chalk.bgBlue(" 2. Manage existing multisig "))
    let answer=await prompt("Enter option number: ")
    
    return await (({
        "1":require("./cli/new-multisig.js"),
        "2":require("./cli/manage-multisig.js")
    })[answer]||(()=>{console.log(chalk.bgRed(" Invalid option "));menu(jwk)}))(jwk)
}