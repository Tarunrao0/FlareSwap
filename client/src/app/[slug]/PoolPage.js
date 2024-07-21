"use client";

import styles from "./page.module.css";
import swap from "../../../public/swap.png";
import Image from "next/image";
import { Rubik_Mono_One } from "next/font/google";
import React, { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { publicClient } from "../components/client";
import { erc20Abi } from "viem";
import { liquidityPoolAbi } from "../constants/constant";

const rubik = Rubik_Mono_One({
  weight: "400",
  subsets: ["latin"],
});

export default function PoolPage({ poolData }) {
  const [token1Balance, setToken1Balance] = useState(null);
  const [token2Balance, setToken2Balance] = useState(null);

  const {
    data: addLiquidityHash,
    error: addLiquidityError,
    isPending: isAddingLiquidity,
    writeContract: writeAddLiquidityContract,
  } = useWriteContract();

  const {
    data: removeLiquidityHash,
    error: removeLiquidityError,
    isPending: isRemovingLiquidity,
    writeContract: writeRemoveLiquidityContract,
  } = useWriteContract();

  const {
    data: swapHash,
    error: swapError,
    isPending: isSwapPending,
    writeContract: writeSwapContract,
  } = useWriteContract();

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const balance1 = await publicClient.readContract({
          address: poolData.token1Address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [poolData.poolAddress],
        });

        setToken1Balance(BigInt(balance1));

        const balance2 = await publicClient.readContract({
          address: poolData.token2Address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [poolData.poolAddress],
        });

        setToken2Balance(BigInt(balance2));
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    fetchBalances();
  }, [poolData]);

  async function approveTokens(tokenAddress, amount) {
    try {
      const approveTransaction = await writeAddLiquidityContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [poolData.poolAddress, BigInt(amount)],
      });
      console.log("Approval transaction hash:", approveTransaction.hash);
    } catch (error) {
      console.error("Error approving tokens:", error);
    }
  }

  async function submitSwap(e) {
    e.preventDefault();
    const swapData = new FormData(e.target);
    const swapAmount = swapData.get("swapAmount");
    const tokenIn = swapData.get("tokenIN");
    const tokenOut = swapData.get("tokenOUT");

    await approveTokens(tokenIn, swapAmount);

    writeSwapContract({
      address: poolData.poolAddress,
      abi: liquidityPoolAbi,
      functionName: "swap",
      args: [BigInt(swapAmount), tokenIn, tokenOut],
    });
    try {
    } catch (swapErr) {
      console.error("Swap error: ", swapErr);
    }
  }

  const { isLoading: isSwapConfirming, isSuccess: isSwapConfirmed } =
    useWaitForTransactionReceipt({ hash: swapHash });

  async function submitAddLiquidity(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const tokenAmountA = formData.get("tokenA");
    const tokenAmountB = formData.get("tokenB");

    console.log("Adding liquidity with amounts:", tokenAmountA, tokenAmountB);
    try {
      await approveTokens(poolData.token1Address, tokenAmountA);
      await approveTokens(poolData.token2Address, tokenAmountB);

      writeAddLiquidityContract({
        address: poolData.poolAddress,
        abi: liquidityPoolAbi,
        functionName: "addLiquidity",
        args: [BigInt(tokenAmountA), BigInt(tokenAmountB)],
      });
    } catch (error) {
      console.error("Error adding liquidity:", error);
    }
  }

  const {
    isLoading: isAddLiquidityConfirming,
    isSuccess: isAddLiquidityConfirmed,
  } = useWaitForTransactionReceipt({ hash: addLiquidityHash });

  async function submitRemoveLiquidity(e) {
    e.preventDefault();
    const removeFormData = new FormData(e.target);
    const removeAmount = removeFormData.get("flare");

    try {
      writeRemoveLiquidityContract({
        abi: liquidityPoolAbi,
        address: poolData.poolAddress,
        functionName: "removeLiquidity",
        args: [BigInt(removeAmount)],
      });
    } catch (err) {
      console.error("Error removing liquidity: ", err.message);
    }
  }

  const {
    isLoading: isRemoveLiquidityConfirming,
    isSuccess: isRemoveLiquidityConfirmed,
  } = useWaitForTransactionReceipt({ hash: removeLiquidityHash });

  return (
    <div>
      <div className={styles.main}>
        <div className={styles.heading}>
          <h1 className={rubik.className}>
            {poolData.token1Name}/{poolData.token2Name} Pool
          </h1>
        </div>
        <div className={rubik.className}>
          <div>
            <div className={styles.boxContainer}>
              <div className={styles.box}>
                <ul>
                  <h3 className={styles.balance}>{poolData.token1Name}</h3>

                  <p>
                    {token1Balance !== null
                      ? token1Balance.toString()
                      : "Loading..."}
                  </p>
                </ul>
              </div>
              <Image
                className={styles.swapImage}
                src={swap}
                alt="swap"
                priority
              />
              <div className={styles.box}>
                <ul>
                  <h3 className={styles.balance}>{poolData.token2Name}</h3>
                  <p>
                    {token2Balance !== null
                      ? token2Balance.toString()
                      : "Loading..."}
                  </p>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.poolDetails}>
          <details>
            <summary className={rubik.className}>Pool Details</summary>
            <p>Pool Address: {poolData.poolAddress}</p>
            <p>
              {poolData.token1Name}: {poolData.token1Address}
            </p>
            <p>
              {poolData.token2Name}: {poolData.token2Address}
            </p>
          </details>
        </div>
      </div>
      <div className={styles.swapMain}>
        <form onSubmit={submitSwap}>
          <div>
            <div className={rubik.className}>
              <input
                className={styles.inputBox}
                name="swapAmount"
                placeholder="Enter swap amount"
              />
            </div>
            <div className={styles.swapContainer}>
              <input
                className={styles.inputAddressBox}
                name="tokenIN"
                placeholder="TokenIN"
              />
              <input
                className={styles.inputAddressBox}
                name="tokenOUT"
                placeholder="TokenOUT"
              />
            </div>
            <button
              type="submit"
              className={styles.swapButton}
              disabled={isSwapPending}
            >
              {isSwapPending ? "Confirming..." : "Swap"}
            </button>
          </div>
          <div>
            {swapHash && <div>Transaction Hash: {swapHash}</div>}
            {isSwapConfirming && (
              <div className={styles.misc}>Waiting for confirmation...</div>
            )}
            {isSwapConfirmed && (
              <div className={styles.misc}>Transaction confirmed.</div>
            )}
            {swapError && <div>Error: {swapError.message}</div>}
          </div>
        </form>
      </div>
      <div>
        <div className={styles.addLiquidityContainer}>
          <h1 className={rubik.className}>Add/Remove liquidity</h1>
          <div>
            <p>
              Become a vital part of our liquidity pool by contributing your
              assets.
            </p>
            <p>How this works : </p>
            <p>
              Deposit {poolData.token1Name} and {poolData.token2Name} into the
              pool, following the required ratio.
            </p>
            <p>
              Upon depositing, you will receive Flare tokens, which are
              Liquidity Pool Tokens. These tokens signify your share in the
              pool.
            </p>
            <p>
              Each time a swap is executed, a small fee is collected. By keeping
              your tokens in the pool, you earn yield over time.
            </p>
            <p>
              Tokens can be removed from the pool anytime by burning the Flare
              Tokens.
            </p>
          </div>
        </div>
      </div>
      <div className={styles.formContainer}>
        <form onSubmit={submitAddLiquidity}>
          <div className={styles.addLiquidity}>
            <label className={rubik.className}>
              {poolData.token1Name} Amount
            </label>
            <input type="text" name="tokenA" required />
            <label className={rubik.className}>
              {poolData.token2Name} Amount
            </label>
            <input type="text" name="tokenB" required />
            <button
              className={styles.createPool}
              disabled={isAddingLiquidity}
              type="submit"
            >
              {isAddingLiquidity ? "Confirming..." : "Add liquidity"}
            </button>
            <div>
              {addLiquidityHash && (
                <div>Transaction Hash: {addLiquidityHash}</div>
              )}
              {isAddLiquidityConfirming && (
                <div className={styles.misc}>Waiting for confirmation...</div>
              )}
              {isAddLiquidityConfirmed && (
                <div className={styles.misc}>Transaction confirmed.</div>
              )}
              {addLiquidityError && (
                <div>Error: {addLiquidityError.message}</div>
              )}
            </div>
          </div>
        </form>
        <form onSubmit={submitRemoveLiquidity}>
          <div className={styles.removeLiquidity}>
            <label className={rubik.className}>Flare Amount</label>
            <input type="text" name="flare" required />
            <button
              className={styles.createPool}
              disabled={isRemovingLiquidity}
              type="submit"
            >
              {isRemovingLiquidity ? "Confirming..." : "Remove Liquidity"}
            </button>
            <div>
              {removeLiquidityHash && (
                <div>Transaction Hash: {removeLiquidityHash}</div>
              )}
              {isRemoveLiquidityConfirming && (
                <div className={styles.misc}>Waiting for confirmation...</div>
              )}
              {isRemoveLiquidityConfirmed && (
                <div className={styles.misc}>Transaction confirmed.</div>
              )}
              {removeLiquidityError && (
                <div>Error: {removeLiquidityError.message}</div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
