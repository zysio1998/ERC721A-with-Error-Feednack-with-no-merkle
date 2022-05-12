1. git clone 
2. cd into file
3. yarn install
4. yarn start
5. yarn build
6. deploy on vercel or wherever

Links to all

1. link to etherscan - https://rinkeby.etherscan.io/address/0x3d90Fd5640b2B81860179BE5155d554d2125cB92
2. link to dapp - https://erc-721-an-o-merkle-build.vercel.app/
3. link to build folder - https://github.com/zysio1998/ERC721ANoMerkleBuild

To change this to suit a specific project

1. Create a contract on remix and deploy it and set the max per transaction allowed for public. AMOUNTFORTEAM and _MAXPUBLICTX. They must match
2. Verify the Contract
3. Change the contract address in the dapp
4. Change the ABI in the ABI.json file

5. setBaseURi
6. set the public active when needed


The add the Base URI including a backslash
e.g https://ipfs.io/ipfs/QmaYsLRXHahhBzSP4DFRNacWcCgJug32KnmfH8rNLn9ArW/


User feedback from the Solidity Smart Contract, revert reason
Change the error messages to whatever you have in the contract

The smart contract uses ERC721A - for extreme cheap transactions

The UI is not complete, it's just made for functionality

The DAPP prompts a network switch if the user is on the wrong network




