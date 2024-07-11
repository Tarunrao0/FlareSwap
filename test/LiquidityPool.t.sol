// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {Flare} from "../src/Flare.sol";
import {PoolDeployer} from "../src/PoolDeployer.sol";
import {LiquidityPool} from "../src/LiquidityPool.sol";

import {mockUSDC} from "../src/mocks/mockUSDC.sol";
import {mockWETH} from "../src/mocks/mockWETH.sol";
import {mockAAVE} from "../src/mocks/mockAAVE.sol";
import {mockDAI} from "../src/mocks/mockDAI.sol";

contract PoolTest is Test {
    Flare public flare;
    PoolDeployer public factory;
    LiquidityPool public pool;

    address owner = makeAddr("owner");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address charlie = makeAddr("charlie");
    address public poolAddress;

    mockUSDC public usdc;
    mockWETH public weth;
    mockAAVE public aave;
    mockDAI public dai;

    function setUp() public {
        flare = new Flare(owner);
        factory = new PoolDeployer(owner, address(flare));

        usdc = new mockUSDC();
        weth = new mockWETH();
        aave = new mockAAVE();
        dai = new mockDAI();

        usdc.mint(address(alice), 100);
        weth.mint(address(alice), 100);

        usdc.mint(address(charlie), 100);
        weth.mint(address(charlie), 100);

        usdc.mint(address(bob), 10);

        aave.mint(address(bob), 100);
        dai.mint(address(bob), 100);

        vm.prank(owner);
        flare.authorizeContract(address(factory));

        (pool, poolAddress) = factory.createPool(address(usdc), address(weth));
    }

    //balance 0 test case
    function test_add_liquidity() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 10);
        weth.approve(poolAddress, 20);
        pool.addLiquidity(10, 20);
        vm.stopPrank();
    }

    function test_second_depositor_proper_ratio() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 10);
        weth.approve(poolAddress, 20);
        pool.addLiquidity(10, 20);
        vm.stopPrank();

        //lets try with an improper ratio

        vm.startPrank(alice);
        usdc.approve(poolAddress, 10);
        weth.approve(poolAddress, 20);
        pool.addLiquidity(10, 20);
        vm.stopPrank();

        assertEq(usdc.balanceOf(poolAddress), 20);
        assertEq(weth.balanceOf(poolAddress), 40);

        assertEq(pool.getReserve1(), 20);
        assertEq(pool.getReserve2(), 40);

        assertEq(flare.balanceOf(alice), 60);
    }

    function test_zero_amount_revert() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 10);
        weth.approve(poolAddress, 20);
        vm.expectRevert("Invalid Amount");
        pool.addLiquidity(0, 10);
        vm.stopPrank();
    }

    //remove complete liquidity
    function test_remove_liquidity() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 10);
        weth.approve(poolAddress, 20);
        pool.addLiquidity(10, 20);
        vm.stopPrank();

        vm.startPrank(alice);
        pool.removeLiquidity(30);
        vm.stopPrank();

        assertEq(flare.balanceOf(alice), 0);
    }

    function test_remove_partial_liquidity() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 10);
        weth.approve(poolAddress, 20);
        pool.addLiquidity(10, 20);
        vm.stopPrank();

        vm.startPrank(alice);
        pool.removeLiquidity(15);
        vm.stopPrank();

        assertEq(flare.balanceOf(alice), 15);
    }

    function test_remove_excess_liquidity() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 10);
        weth.approve(poolAddress, 20);
        pool.addLiquidity(10, 20);
        vm.stopPrank();

        vm.startPrank(alice);
        vm.expectRevert("Invalid Amount");
        pool.removeLiquidity(3000);
        vm.stopPrank();
    }

    function test_remove_zero_liquidity() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 10);
        weth.approve(poolAddress, 20);
        pool.addLiquidity(10, 20);
        vm.stopPrank();

        vm.startPrank(alice);
        vm.expectRevert("amount cant be 0");
        pool.removeLiquidity(0);
        vm.stopPrank();
    }

    /** THE GREAT SWAP */

    function test_swap() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 40);
        weth.approve(poolAddress, 80);
        pool.addLiquidity(40, 80);
        vm.stopPrank();

        uint before_reserve1 = pool.getReserve1();
        uint before_reserve2 = pool.getReserve2();

        vm.startPrank(bob);
        usdc.approve(poolAddress, 10);
        pool.swap(10, address(usdc), address(weth));
        vm.stopPrank();

        assertGt(pool.getReserve1(), before_reserve1);
        assertGt(before_reserve2, pool.getReserve2());

        assertEq(usdc.balanceOf(bob), 0);
        assertGt(weth.balanceOf(bob), 0);

        vm.startPrank(alice);
        usdc.approve(poolAddress, 10);
        weth.approve(poolAddress, 20);
        pool.addLiquidity(10, 20);
        vm.stopPrank();
    }

    function test_swap_reverts_zero_amount() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 40);
        weth.approve(poolAddress, 80);
        pool.addLiquidity(40, 80);
        vm.stopPrank();

        vm.startPrank(bob);
        usdc.approve(poolAddress, 10);
        vm.expectRevert("Invalid Amount");
        pool.swap(0, address(usdc), address(weth));
        vm.stopPrank();
    }

    function test_swap_reverts_invalid_in_token() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 40);
        weth.approve(poolAddress, 80);
        pool.addLiquidity(40, 80);
        vm.stopPrank();

        vm.startPrank(bob);
        usdc.approve(poolAddress, 10);
        vm.expectRevert("Invalid Input Token");
        pool.swap(10, address(aave), address(weth));
        vm.stopPrank();
    }

    function test_swap_reverts_invalid_out_token() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 40);
        weth.approve(poolAddress, 80);
        pool.addLiquidity(40, 80);
        vm.stopPrank();

        vm.startPrank(bob);
        usdc.approve(poolAddress, 10);
        vm.expectRevert("Invalid Output Token");
        pool.swap(10, address(usdc), address(aave));
        vm.stopPrank();
    }

    function test_swap_reverts_same_token() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 40);
        weth.approve(poolAddress, 80);
        pool.addLiquidity(40, 80);
        vm.stopPrank();

        vm.startPrank(bob);
        usdc.approve(poolAddress, 10);
        vm.expectRevert("Cant swap same tokens");
        pool.swap(10, address(weth), address(weth));
        vm.stopPrank();
    }

    function test_user_gets_full_amount_back_from_remove() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 40);
        weth.approve(poolAddress, 80);
        pool.addLiquidity(40, 80);
        vm.stopPrank();

        //test to check if alice gets back what she deposited

        vm.startPrank(alice);
        pool.removeLiquidity(120);
        vm.stopPrank();

        assertEq(usdc.balanceOf(address(alice)), 100);
        assertEq(weth.balanceOf(address(alice)), 100);
    }

    //Gets a profit on USDC due to a usdc swap taking place
    function test_providers_profit() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 40);
        weth.approve(poolAddress, 80);
        pool.addLiquidity(40, 80);
        vm.stopPrank();

        vm.startPrank(charlie);
        usdc.approve(poolAddress, 40);
        weth.approve(poolAddress, 80);
        pool.addLiquidity(40, 80);
        vm.stopPrank();

        vm.startPrank(bob);
        usdc.approve(poolAddress, 10);
        pool.swap(10, address(usdc), address(weth));
        vm.stopPrank();

        vm.startPrank(alice);
        pool.removeLiquidity(120);
        vm.stopPrank();

        console.log("alice's usdc balance", usdc.balanceOf(address(alice)));
        console.log("alice's weth balance", weth.balanceOf(address(alice)));

        console.log("pool balance : ", usdc.balanceOf(address(pool)));
        console.log("pool balance : ", weth.balanceOf(address(pool)));
    }

    function test_getReserve1() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 40);
        weth.approve(poolAddress, 80);
        pool.addLiquidity(40, 80);
        vm.stopPrank();

        uint amount = pool.getReserve1();

        assertEq(amount, 40);
    }

    function test_getReserve2() public {
        vm.startPrank(alice);
        usdc.approve(poolAddress, 40);
        weth.approve(poolAddress, 80);
        pool.addLiquidity(40, 80);
        vm.stopPrank();

        uint amount = pool.getReserve2();

        assertEq(amount, 80);
    }
}
