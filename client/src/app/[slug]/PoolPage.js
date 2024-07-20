"use client";

import styles from "./page.module.css";
import swap from "../../../public/swap.png";
import Image from "next/image";
import { Rubik_Lines, Rubik_Mono_One } from "next/font/google";
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

  const { data: hash, error, isPending, writeContract } = useWriteContract();

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
      const approveTransaction = await writeContract({
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

  async function submitAddLiquidity(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const tokenAmountA = formData.get("tokenA");
    const tokenAmountB = formData.get("tokenB");

    console.log("Adding liquidity with amounts:", tokenAmountA, tokenAmountB);
    try {
      await approveTokens(poolData.token1Address, tokenAmountA);
      await approveTokens(poolData.token2Address, tokenAmountB);

      writeContract({
        address: poolData.poolAddress,
        abi: liquidityPoolAbi,
        functionName: "addLiquidity",
        args: [BigInt(tokenAmountA), BigInt(tokenAmountB)],
      });
    } catch (error) {
      console.error("Error adding liquidity:", error);
    }
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  return (
    <div className={styles.gridPattern}>
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
        <p>Pool Address: {poolData.poolAddress}</p>
        <p>
          Token 1: {poolData.token1Name}: {poolData.token1Address}
        </p>
        <p>
          Token 2: {poolData.token2Name}: {poolData.token2Address}
        </p>
      </div>

      <form onSubmit={submitAddLiquidity}>
        <div>
          <ul>
            <label>{poolData.token1Name} Amount</label>
            <input type="text" name="tokenA" required />
            <label>{poolData.token2Name} Amount</label>
            <input type="text" name="tokenB" required />
            <button
              className={styles.createPool}
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Confirming..." : "Add liquidity"}
            </button>
            <div>
              {hash && <div>Transaction Hash: {hash}</div>}
              {isConfirming && (
                <div className={styles.misc}>Waiting for confirmation...</div>
              )}
              {isConfirmed && (
                <div className={styles.misc}>Transaction confirmed.</div>
              )}
              {error && <div>Error: {error.message}</div>}
            </div>
          </ul>
        </div>
      </form>
    </div>
  );
}
