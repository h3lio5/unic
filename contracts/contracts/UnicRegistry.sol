// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract UnicRegistry {
    mapping(address => bool) public isRegistered;
    mapping(address => bool) public hasClaimed;
    mapping(uint => address) public idToAddress;

    event RegisterUser(address indexed userAddr, uint256[] embedding);
    event Claimed(address userAddr);

    function registerUser(uint256[] calldata embedding) external {
        emit RegisterUser(msg.sender, embedding);
    }

    function onRegister(uint256 id, address userAddr) external {
        require(idToAddress[id] != address(0), "Already registered");
        idToAddress[id] = userAddr;
        isRegistered[userAddr] = true;
    }

    function claim() external {
        require(isRegistered[msg.sender], "User not registered");
        require(!hasClaimed[msg.sender], "Already claimed");

        emit Claimed(msg.sender);
    }

    function checkClaimEligibility() external view returns (bool) {
        return isRegistered[msg.sender] && !hasClaimed[msg.sender];
    }
}
