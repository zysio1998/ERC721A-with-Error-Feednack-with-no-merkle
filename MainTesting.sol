// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ERC721A.sol";

contract MainTesting is ERC721A, Ownable {
    uint256 public maxSupply = 1000; 
    uint256 public price = 0.05 ether;    
    uint256 public maxPublic = 10; //max total for public mint
    uint256 public maxPublicTx; //max per tx public mint   

    bool public _isActive = false;   
    
    mapping(address => uint256) public _publicCounter;   

    // metadata URI
    string private _baseTokenURI;

    constructor(       
        uint256 _amountForTeam,
        uint256 _maxPublicTx
    )
        ERC721A("ERC721A testing", "721A", _amountForTeam, _maxPublicTx)        
    {
        maxPublicTx = _maxPublicTx;        
    }

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "The caller is another contract");
        _;
    }

    //set variables
    function setPublicActive(bool isActive) external onlyOwner {
        _isActive = isActive;
    }    

    function setMaxSupply(uint256 _newmaxSupply) public onlyOwner {
        maxSupply = _newmaxSupply;
    }

    function setNewPrice(uint256 _newPrice) public onlyOwner {
        price = _newPrice;
    }    

    function setMaxMints(uint256 maxMints_) public onlyOwner {
        maxPublic = maxMints_;
    }            

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    } 

    //withdraw to owner wallet
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    // public mint
    function publicSaleMint(uint256 quantity)
        external
        payable        
        callerIsUser
    {
        require(quantity > 0, "Must mint more than 0 tokens at a time");
        require(_isActive, "Public mint has not begun yet");
        require(price * quantity >= msg.value, "Incorrect funds");
        require(quantity <= maxPublicTx, "Exceeds max per transaction");
        require(_publicCounter[msg.sender] + quantity <= maxPublic, "Exceeds max per address");
        require(totalSupply() + quantity <= maxSupply, "No more NFTs left");

        _safeMint(msg.sender, quantity);
        _publicCounter[msg.sender] = _publicCounter[msg.sender] + quantity;
    }
}