// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract mockAAVE is ERC20 {
    mapping(address => bool) public authorizedContracts;

    constructor() ERC20("AAVE", "AAVE") {}

    function mint(address account, uint256 value) public {
        _mint(account, value);
    }
}
