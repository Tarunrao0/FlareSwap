// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {Flare} from "../src/Flare.sol";
import {PoolDeployer} from "../src/PoolDeployer.sol";

contract FactoryTest is Test {
    Flare public flare;
    PoolDeployer public factory;

    address owner = makeAddr("owner");
    address alice = makeAddr("alice");

    address token1 = makeAddr("token1");
    address token2 = makeAddr("token2");

    function setUp() public {
        flare = new Flare(owner);
        factory = new PoolDeployer(owner);

        vm.prank(owner);
        flare.authorizeContract(address(factory));
    }

    function test_reverts_invalid_tokens() public {
        vm.prank(alice);
        vm.expectRevert("Invalid Token Address");
        factory.createPool(address(0), token2);
    }

    function test_reverts_tokens_unique() public {
        vm.prank(alice);
        vm.expectRevert("token addresses need to be unique");
        factory.createPool(token2, token2);
    }

    function test_create_pool() public {
        vm.prank(alice);
        factory.createPool(token1, token2);
    }
}
