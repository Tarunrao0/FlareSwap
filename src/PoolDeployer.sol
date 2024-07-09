// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {LiquidityPool} from "./LiquidityPool.sol";
import {Flare} from "./Flare.sol";

contract PoolDeployer {
    mapping(address => mapping(address => address)) public getPool;

    event PoolCreated(
        address indexed token1,
        address indexed token2,
        address pool
    );

    address public owner;
    Flare public flare;

    constructor(address _owner) {
        owner = _owner;
        flare = new Flare(owner);
        flare.authorizeContract(address(this));
    }

    /**
     *  A user can fully customize the pair of liquidity tokens for their pool. UNLESS, a pool with the same pair already exists. They also get to design the name and symbol of the
     * Liquidity Pool Tokens the liquidity providers will be recieving for investing in the pool
     * @param _token1 Type 1 token
     * @param _token2 Type 2 token
     */
    function createPool(address _token1, address _token2) public {
        require(
            getPool[_token1][_token2] == address(0) &&
                getPool[_token2][_token1] == address(0),
            "Pool already exists!!"
        );
        require(_token1 == _token2, "token addresses need to be unique");
        require(
            _token1 != address(0) && _token2 != address(0),
            "Invalid Token Address"
        );

        address pool = address(
            new LiquidityPool(_token1, _token2, owner, flare)
        );
        flare.authorizeContract(pool);

        getPool[_token1][_token2] = pool;
        getPool[_token2][_token1] = pool;

        emit PoolCreated(_token1, _token2, pool);
    }
}
