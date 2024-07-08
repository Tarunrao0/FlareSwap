// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract LiquidityPool is ERC20, ReentrancyGuard {
    IERC20 public token1;
    IERC20 public token2;

    uint public reserve1;
    uint public reserve2;

    uint public constant SWAP_FEE = 30;

    constructor(
        address _token1,
        address _token2,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
    }

    function calculateLiquidityAmount(
        uint _amount1,
        uint _amount2
    ) private pure returns (uint) {
        return _amount1 + _amount2;
    }

    function addLiquidity(uint _amount1, uint _amount2) external nonReentrant {
        uint balanceToken1 = token1.balanceOf(address(this));
        uint balanceToken2 = token2.balanceOf(address(this));

        uint suppliedToken1 = _amount1;
        uint suppliedToken2 = _amount2;

        //the existing balance is already in x * y = k ratio
        require(
            suppliedToken1 * balanceToken2 == suppliedToken2 * balanceToken1,
            "Invalid ratio"
        );

        token1.transferFrom(msg.sender, address(this), _amount1);
        token1.transferFrom(msg.sender, address(this), _amount2);

        uint liquidity = calculateLiquidityAmount(_amount1, _amount2);
        //These are liquidity tokens.
        _mint(msg.sender, liquidity);

        reserve1 += _amount1;
        reserve2 += _amount2;
    }

    function removeLiquidity(
        uint _amount
    ) external nonReentrant returns (uint, uint) {
        uint totalLiquidity = totalSupply();
        require(_amount <= totalLiquidity, "Invalid Amount");
        //reserve1 and reserve2 have amount1 and amount2 stored in them respectively

        uint amountToken1 = (_amount * reserve1) / totalLiquidity;
        uint amountToken2 = (_amount * reserve2) / totalLiquidity;

        _burn(msg.sender, _amount);

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
}
