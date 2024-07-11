// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract mockDAI is ERC20 {
    mapping(address => bool) public authorizedContracts;

    constructor() ERC20("DAI", "DAI") {}

    function mint(address account, uint256 value) public {
        _mint(account, value);
    }
}
