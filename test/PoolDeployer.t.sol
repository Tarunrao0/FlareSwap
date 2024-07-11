// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {Flare} from "../src/Flare.sol";
import {PoolDeployer} from "../src/PoolDeployer.sol";

import {mockUSDC} from "../src/mocks/mockUSDC.sol";
import {mockWETH} from "../src/mocks/mockWETH.sol";
import {mockAAVE} from "../src/mocks/mockAAVE.sol";
import {mockDAI} from "../src/mocks/mockDAI.sol";

contract FactoryTest is Test {
    Flare public flare;
    PoolDeployer public factory;

    address owner = makeAddr("owner");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    mockUSDC public usdc;
    mockWETH public weth;
    mockAAVE public aave;
    mockDAI public dai;

    function setUp() public {
        flare = new Flare(owner);
        factory = new PoolDeployer(owner, address(flare));

        vm.prank(owner);
        flare.authorizeContract(address(factory));

        usdc = new mockUSDC();
        weth = new mockWETH();
        aave = new mockAAVE();
        dai = new mockDAI();
    }

    function test_reverts_invalid_tokens() public {
        vm.prank(alice);
        vm.expectRevert("Invalid Token Address");
        factory.createPool(address(0), address(weth));
    }

    function test_reverts_invalid_tokens_2() public {
        vm.prank(alice);
        vm.expectRevert("Invalid Token Address");
        factory.createPool(address(usdc), address(0));
    }

    function test_reverts_tokens_unique() public {
        vm.prank(alice);
        vm.expectRevert("token addresses need to be unique");
        factory.createPool(address(weth), address(weth));
    }

    function test_create_pool() public {
        vm.prank(alice);
        factory.createPool(address(usdc), address(weth));
    }

    function test_create_pool_reverts_existing_token_pairs() public {
        vm.prank(alice);
        factory.createPool(address(usdc), address(weth));

        vm.prank(bob);
        vm.expectRevert();
        factory.createPool(address(usdc), address(weth));
    }

    function test_create_pool_reverts_existing_token_pairs_different_order()
        public
    {
        vm.prank(alice);
        factory.createPool(address(usdc), address(weth));

        vm.prank(bob);
        vm.expectRevert();
        factory.createPool(address(weth), address(usdc));
    }

    function test_multiple_pool_creations() public {
        vm.prank(alice);
        (, address pool_1) = factory.createPool(address(usdc), address(weth));

        assertEq(factory.getPool(address(usdc), address(weth)), pool_1);

        vm.prank(bob);
        (, address pool_2) = factory.createPool(address(aave), address(dai));
        assertEq(factory.getPool(address(aave), address(dai)), pool_2);
    }
}
