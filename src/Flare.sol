// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract Flare is ERC20 {
    address public owner;
    mapping(address => bool) public authorizedContracts;

    constructor(address _owner) ERC20("FLARE", "FLARE") {
        owner = _owner;
    }

    function mint(address account, uint256 value) public {
        require(
            msg.sender == owner || authorizedContracts[msg.sender],
            "Unauthorized"
        );
        _mint(account, value);
    }

    function burn(address account, uint256 value) public {
        require(
            msg.sender == owner || authorizedContracts[msg.sender],
            "Unauthorized"
        );
        _burn(account, value);
    }

    function authorizeContract(address _contract) public {
        require(
            msg.sender == owner || authorizedContracts[msg.sender],
            "Unauthorized"
        );
        authorizedContracts[_contract] = true;
    }
}
