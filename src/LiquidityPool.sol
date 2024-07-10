// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {Flare} from "./Flare.sol";

contract LiquidityPool is ReentrancyGuard {
    IERC20 public token1;
    IERC20 public token2;

    uint public reserve1;
    uint public reserve2;

    uint public constant SWAP_FEE = 30;

    address public owner;

    Flare public flare;

    constructor(
        address _token1,
        address _token2,
        address _owner,
        Flare _flare
    ) {
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
        owner = _owner;
        flare = _flare;
    }

    function calculateLiquidityAmount(
        uint _amount1,
        uint _amount2
    ) private pure returns (uint) {
        return _amount1 + _amount2;
    }

    function addLiquidity(uint _amount1, uint _amount2) external nonReentrant {
        require(_amount1 != 0 && _amount2 != 0, "Invalid Amount");

        uint balanceToken1 = token1.balanceOf(address(this));
        uint balanceToken2 = token2.balanceOf(address(this));

        uint suppliedToken1 = _amount1;
        uint suppliedToken2 = _amount2;

        // Check if the pool is being created for the first time
        if (balanceToken1 == 0 && balanceToken2 == 0) {
            // Transfer the tokens to the pool
            token1.transferFrom(msg.sender, address(this), _amount1);
            token2.transferFrom(msg.sender, address(this), _amount2);

            // Set the initial reserve amounts
            reserve1 = _amount1;
            reserve2 = _amount2;

            // Mint the initial liquidity tokens
            uint liquidity = calculateLiquidityAmount(_amount1, _amount2);
            flare.mint(msg.sender, liquidity);
        } else {
            // (x + dx) * (y + dy) = x * y
            require(
                suppliedToken1 * balanceToken2 ==
                    suppliedToken2 * balanceToken1,
                "Invalid Ratio"
            );

            // Transfer the tokens to the pool
            token1.transferFrom(msg.sender, address(this), _amount1);
            token2.transferFrom(msg.sender, address(this), _amount2);

            // Update the reserve amounts
            reserve1 += _amount1;
            reserve2 += _amount2;

            // Mint the liquidity tokens
            uint liquidity = calculateLiquidityAmount(_amount1, _amount2);
            flare.mint(msg.sender, liquidity);
        }
    }

    function removeLiquidity(
        uint _amount
    ) external nonReentrant returns (uint, uint) {
        uint totalLiquidity = flare.totalSupply();
        require(_amount <= totalLiquidity, "Invalid Amount");
        require(_amount != 0, "amount cant be 0");
        //reserve1 and reserve2 have amount1 and amount2 stored in them respectively

        uint amountToken1 = (_amount * reserve1) / totalLiquidity;
        uint amountToken2 = (_amount * reserve2) / totalLiquidity;

        flare.burn(msg.sender, _amount);

        token1.transfer(msg.sender, amountToken1);
        token2.transfer(msg.sender, amountToken2);

        reserve1 -= amountToken1;
        reserve2 -= amountToken2;

        return (amountToken1, amountToken2);
    }

    function swap(
        uint _amountIn,
        address _tokenIn,
        address _tokenOut
    ) external nonReentrant returns (uint amountOut) {
        require(_amountIn > 0, "Invalid Amount");
        require(
            _tokenIn == address(token1) || _tokenIn == address(token2),
            "Invalid Input Token"
        );
        require(
            _tokenOut == address(token1) || _tokenOut == address(token2),
            "Invalid Output Token"
        );
        require(_tokenIn != _tokenOut, "Cant swap same tokens");

        IERC20 tokenIn = IERC20(_tokenIn);
        IERC20 tokenOut = IERC20(_tokenOut);

        uint reserveIn = _tokenIn == address(token1) ? reserve1 : reserve2;
        uint reserveOut = _tokenIn == address(token1) ? reserve2 : reserve1;

        //Invariant check
        require(
            _amountIn * reserveOut <= (reserveIn + _amountIn) * reserveOut,
            "Swap will break the Invariant"
        );

        tokenIn.transferFrom(msg.sender, address(this), _amountIn);

        uint amountInWithFee = (_amountIn * (1000 - SWAP_FEE)) / 1000;
        amountOut =
            (amountInWithFee * reserveOut) /
            (reserveIn + amountInWithFee);

        tokenOut.transfer(msg.sender, amountOut);

        if (_tokenIn == address(token1)) {
            reserve1 += _amountIn;
            reserve2 -= amountOut;
        } else {
            reserve2 += _amountIn;
            reserve1 -= amountOut;
        }

        return amountOut;
    }

    function getReserve1() public view returns (uint) {
        return reserve1;
    }

    function getReserve2() public view returns (uint) {
        return reserve2;
    }

    function getToken1() public view returns (address) {
        return address(token1);
    }

    function getToken2() public view returns (address) {
        return address(token2);
    }
}
