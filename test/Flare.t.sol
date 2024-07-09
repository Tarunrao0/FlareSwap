// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {Flare} from "../src/Flare.sol";
import {PoolDeployer} from "../src/PoolDeployer.sol";

contract TokenTest is Test {
    Flare public flare;
    PoolDeployer public factory;

    address owner = makeAddr("owner");
    address alice = makeAddr("alice");

    function setUp() public {
        flare = new Flare(owner);
        factory = new PoolDeployer(owner);

        vm.prank(owner);
        flare.authorizeContract(address(factory));
    }

    /** MINT */

    function test_mint() public {
        vm.prank(owner);
        flare.mint(address(alice), 10);

        assertEq(flare.balanceOf(alice), 10);
    }

    function test_not_owner_reverts() public {
        vm.prank(alice);
        vm.expectRevert();
        flare.mint(address(alice), 10);
    }

    function test_allow_authorized_mint() public {
        vm.prank(address(factory));
        flare.mint(address(alice), 10);

        assertEq(flare.balanceOf(alice), 10);
    }

    function test_mint_fails_for_0x00() public {
        vm.prank(owner);
        vm.expectRevert();
        flare.mint(address(0), 10);
    }

    /** BURN */

    function test_burn() public {
        vm.prank(owner);
        flare.mint(address(alice), 10);

        assertEq(flare.balanceOf(alice), 10);

        vm.prank(owner);
        flare.burn(address(alice), 10);

        assertEq(flare.balanceOf(alice), 0);
    }

    function test_burn_works_for_authorized() public {
        vm.prank(address(factory));
        flare.mint(address(alice), 10);

        assertEq(flare.balanceOf(alice), 10);

        vm.prank(address(factory));
        flare.burn(address(alice), 10);

        assertEq(flare.balanceOf(alice), 0);
    }

    function test_burn_reverts_without_mint() public {
        vm.prank(address(factory));
        vm.expectRevert();
        flare.burn(address(alice), 10);
    }

    function test_burn_reverts_for_unauthorized() public {
        vm.prank(owner);
        flare.mint(address(alice), 10);

        assertEq(flare.balanceOf(alice), 10);

        vm.prank(alice);
        vm.expectRevert();
        flare.burn(address(alice), 10);
    }

    function test_burn_reverts_for_address_0x00() public {
        vm.prank(owner);
        flare.mint(address(alice), 10);

        assertEq(flare.balanceOf(alice), 10);

        vm.prank(owner);
        vm.expectRevert();
        flare.burn(address(0), 10);
    }

    /** AUTHORIZE CONTRACT */

    function test_reverts_non_owner() public {
        vm.prank(alice);
        vm.expectRevert();
        flare.authorizeContract(address(factory));
    }

    function test_authorize_contract() public {
        vm.prank(owner);
        flare.authorizeContract(address(factory));

        assertEq(flare.authorizedContracts(address(factory)), true);
    }

    function test_authorized_contract_access() public {
        vm.prank(address(factory));
        flare.authorizeContract(address(1));

        assertEq(flare.authorizedContracts(address(1)), true);
    }
}
