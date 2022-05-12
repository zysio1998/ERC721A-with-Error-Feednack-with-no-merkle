import React, { useEffect, useState } from "react";
import './styles/App.css';
import { ethers } from "ethers"
import myNft from "./ABI.json"
import {networks} from "./networks"
import Swal from 'sweetalert2'
import axios from "axios";
import { wait } from "@testing-library/user-event/dist/utils";

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3("https://eth-rinkeby.alchemyapi.io/v2/4V5OB61hmIw0_boKEQYbpJBg8QyR-lWf"); 

const contractAddress = "0x3d90Fd5640b2B81860179BE5155d554d2125cB92" 

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [selectedAddress, setSelectedAddress] = useState('')
  const [loading, setloading] = useState(false);
  const [network, setNetwork] = useState('')

  var passedTxnHash = ''

  const init = async () => {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {      

        setloading(false)
    } else {
      console.log('Metamask not installed')
    }
  }

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      switchNetwork()
     
      // setupEventListener()
    } else {
      console.log("No authorized account found")
    }

    // This is the new part, we check the user's network chain ID
    const chainId = await ethereum.request({ method: 'eth_chainId' })
    setNetwork(networks[chainId])

    ethereum.on('chainChanged', handleChainChanged)

    function handleChainChanged(_chainId) {
      window.location.reload()
    }
  }


  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      switchNetwork()
      // setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Try to switch to the Mumbai testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4' }], // Check networks.js for hexadecimal network ids
        })
      } catch (error) {
        // This error code means that the chain we want has not been added to MetaMask
        // In this case we ask the user to add it to their MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x4',
                  chainName: 'Rinkeby',
                  rpcUrls: [
                    'https://eth-rinkeby.alchemyapi.io/v2/4V5OB61hmIw0_boKEQYbpJBg8QyR-lWf',
                  ],
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://rinkeby.etherscan.io/'],
                },
              ],
            })
          } catch (error) {
            console.log(error)
          }
        }
        console.log(error)
      }
    } else {
      // If window.ethereum is not found then MetaMask is not installed
      alert(
        'MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html'
      )
    }
  }

  const mintONE = async () => {
    askContractToMintNft(1);
  }

  const mintTWO = async () => {
    askContractToMintNft(2);
  }

  const mintTHREE = async () => {
    askContractToMintNft(3);
  }

  async function askContractToMintNft(quantity) {
    try {
        setloading(true)
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();             
        const contractInstance = new ethers.Contract(contractAddress, myNft.abi, provider)    

        async function getGasPrice() {
          let feeData = await provider.getFeeData()
          return feeData.gasPrice
        }

        async function getNonce(signer) {
          return (await signer).getTransactionCount()
        }

        if (currentAccount !== '') {            
          const nonce = await getNonce(signer)
          const gasFee = await getGasPrice()          

          let rawTxn = await contractInstance.populateTransaction.publicSaleMint(quantity, {
            /* global BigInt */  
            value: BigInt((50000000000000000 * quantity).toString()),
            gasLimit: (285000 * quantity),
            nonce: nonce
          })
          console.log("...Submitting transaction with gas price of:", ethers.utils.formatUnits(gasFee, "gwei"), "in gwei - & nonce:", nonce)
          let signedTxn = signer.sendTransaction(rawTxn)
          let reciept = (await signedTxn).wait()  

          const myHash = ((await signedTxn).hash) 
          const glass = () => {   //used to pass it as a global variabe for the catch to display the revert reason       
            passedTxnHash = myHash  
            return passedTxnHash          
          }
          glass()

          if (reciept) {          
            console.log("Transaction is successful!!!" + '\n' + "Transaction Hash:", (await signedTxn).hash + '\n' + "Block Number: " + (await reciept).blockNumber + '\n' + "Navigate to https://rinkeby.etherscan.io/tx/" + (await signedTxn).hash, "to see your transaction")
            Swal.fire({
              title: 'Minting successfull',
              html:
                'Hey there! we are minted successfully completed.' +
                `<a href=' https://rinkeby.etherscan.io/tx/${(await signedTxn).hash}' target="_blank"> rinkeby.etherscan.io/</a> ` +
                '',
                width: 600,
                padding: '3em',
                color: '#716add',
                background: '#fff url(/images/trees.png)',
                backdrop: `
                rgba(0,0,123,0.4)
                url("/images/nyan-cat.gif")
                left top
                no-repeat
                `
            })             
              setloading(false) 
          } else {
            console.log("Error submitting transaction")          
            setloading(false)          
          }           
        }
        else {
            console.log("Wrong network - Connect to configured chain ID first!")          
            setloading(false)
            Swal.fire(
              'Connect wallet',
              'Before minting you must connect your wallet',
              'question'
            )
        }    
    } catch (e) {      
        console.log("Error Caught in Catch Statement: ", e)  
        
        if(e.message == "MetaMask Tx Signature: User denied transaction signature."){
          Swal.fire({
            icon: 'error',
            title: 'Minting Failed',
            text: 'Minting failed, you rejected the transaction, try again',         
          }) 
          setloading(false) 
          return 0;
        }else{

        }      
        
        //const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
        //const web3 = createAlchemyWeb3("https://eth-rinkeby.alchemyapi.io/v2/4V5OB61hmIw0_boKEQYbpJBg8QyR-lWf"); 
        const txn = await web3.eth.getTransaction(passedTxnHash)
        console.log("transaction hash: ", passedTxnHash)
        console.log("trying to do getTransaction", txn)
          
        let replay_tx = {
          to: txn['to'],
          from: txn['from'],
          value: txn['value'],
          data: txn['input'],
        }      
          
        try{
          const pullCall = await web3.eth.call(replay_tx, txn.blockNumber)
          console.log("Working ok", pullCall)
        }catch (error){
          console.log("error is from long stuff here:" ,error)   
          if(error == "Error: Returned error: execution reverted: Public mint has not begun yet"){
            Swal.fire({
              icon: 'error',
              title: 'Minting Failed',
              text: 'Public mint has not started yet',
            
            })          
          }else if(error == "Error: Returned error: execution reverted: Exceeds max per transaction"){
            Swal.fire({
              icon: 'error',
              title: 'Minting Failed',
              text: 'Can not mint more than 3 at a time',
            
            })
          }else if(error == "Error: Returned error: execution reverted: Incorrect funds"){
            Swal.fire({
              icon: 'error',
              title: 'Minting Failed',
              text: 'Incorrect amount of ETH',
            
            })
          }else if(error == "Error: Returned error: execution reverted: Exceeds max per address"){
            Swal.fire({
              icon: 'error',
              title: 'Minting Failed',
              text: 'Can not mint more then 3 on the public mint',
            
            })
          }else if(error == "Error: Returned error: execution reverted: Must mint more than 0 tokens at a time"){
            Swal.fire({
              icon: 'error',
              title: 'Minting Failed',
              text: 'You must mint more than 1 NFT',
            
            })
          }else if(error == "Error: Returned error: execution reverted: No more NFTs left"){
            Swal.fire({
              icon: 'error',
              title: 'Minting Failed',
              text: 'All the NFTs are gone',
            
            })
          }else{
            Swal.fire({
              icon: 'error',
              title: 'Minting Failed',
              text: 'Please try again',
            
            })   
          }       
        }
      
        
        setloading(false)    
    }
  }  

  useEffect(() => {
    checkIfWalletIsConnected();
    if(currentAccount != ''){
      setloading(true)
    }

    if (currentAccount !== '' && network === 'Rinkeby') {      
      init()
    }
  }, [network])


  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  return (
    <div className="App">
      {
        loading ?
          <div className="loading">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          :
          ""}
      <div className={loading ? "container disabledbutton" : "container"}>
        <div className="nav header-container">
          <div className="connect">
            {currentAccount === "" ? (
              renderNotConnectedContainer()
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="container">
          <h1 class="arek">ERC721A with User Feedback For Errors - no merkle </h1>            
          <p class="arek">Error checking with feedback and only allowed to mint the when public is active and you have a max per wallet allowed</p>    
          <div className="row body">
            <div className="col-md-6 tesboddy ff">  
              <div className=" mint_div ">                
                <button onClick={mintONE} className="cta-button connect-wallet-button">                
                  Mint NFT public 1 nft
                </button>
                <button onClick={mintTWO} className="cta-button connect-wallet-button">                
                  Mint NFT public 2 nft
                </button> 
                <button onClick={mintTHREE} className="cta-button connect-wallet-button">                
                  Mint NFT public 3 nft
                </button>                
                </div>
            </div>            
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;