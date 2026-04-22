// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LearnToken {
    string public name = "Learn Token";
    string public symbol = "LEARN";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Minted(address indexed to, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) external {
        // Allow anyone to mint for hackathon demo purposes
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
        emit Minted(to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
