"use client";

import React, { useState } from "react";
import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWriteContract,
  useWatchContractEvent,
} from "wagmi";
import {
  poolDeployerAddress,
  poolDeployerAbi,
  erc20Abi,
} from "../constants/constant";
import { publicClient } from "../components/client";
import styles from "./page.module.css";
import { updatePool } from "../../../lib/actions";

interface PoolCreatedEventArgs {
  pool: string;
  token1: string;
  token2: string;
}
import { Rubik_Mono_One } from "next/font/google";

const rubik = Rubik_Mono_One({
  weight: "400",
  subsets: ["latin"],
});

export default function CreatePool() {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const [poolAddress, setPoolAddress] = useState("");
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const [token1Address, setToken1Address] = useState("");
  const [token2Address, setToken2Address] = useState("");

  const updatePoolCallback = (poolAddress: string) => {
    updatePool(nameA, nameB, poolAddress, token1Address, token2Address);
  };

  useWatchContractEvent({
    address: poolDeployerAddress,
    abi: poolDeployerAbi,
    eventName: "PoolCreated",
    onLogs(logs) {
      console.log("New logs!", logs);
      if (logs.length > 0) {
        const log = logs[0] as unknown as { args: PoolCreatedEventArgs };
        const pool = log.args.pool;
        console.log("Pool Address:", pool);
        setPoolAddress(pool);

        console.log("Updating pool with:", {
          nameA,
          nameB,
          poolAddress,
          token1Address,
          token2Address,
        });

        updatePoolCallback(pool);
      }
    },
  });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const tokenA = formData.get("tokenA") as string;
    const tokenB = formData.get("tokenB") as string;

    setToken1Address(tokenA);
    setToken2Address(tokenB);

    try {
      const sym1 = await publicClient.readContract({
        address: tokenA as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
      });

      const sym2 = await publicClient.readContract({
        address: tokenB as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
      });

      setNameA(sym1 as string);
      setNameB(sym2 as string);
    } catch (error) {
      console.error("Error reading contract symbol:", error);
    }
    // Call createPool
    writeContract({
      address: poolDeployerAddress,
      abi: poolDeployerAbi,
      functionName: "createPool",
      args: [tokenA, tokenB],
    });
  }

  // Custom handlings
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  return (
    <form onSubmit={submit}>
      <ul>
        <div className={styles.div}>
          <div className={rubik.className}>
            <h1 className={styles.heading}>
              Create a custom{""} <span className={styles.highlight}>pool</span>{" "}
            </h1>
          </div>
          <ul>
            <p className={styles.main}>
              Dont see a pool with the tokens of your liking?
            </p>
            <p className={styles.main}>
              No problem!! Create your own pool. Its simple, all you need to do
              is :
            </p>
            <div className={styles.points}>
              <li>
                <p>Find two tokens of your liking</p>
              </li>
              <li>
                <p>Make sure these tokens are ERC-20 contracts</p>
              </li>
              <li>
                <p>Get their contract addresses</p>
              </li>
              <li>
                <p>
                  Enter the addresses in the form below and you'll have your own
                  fully functional customized pool!!
                </p>
              </li>
            </div>
          </ul>
        </div>
        <div className={styles.box}>
          <ul>
            <h3>TOKEN A</h3>
            <input className={styles.input} name="tokenA" required />

            <h3>TOKEN B</h3>
            <input className={styles.input} name="tokenB" required />
            <div className={styles.button}>
              <button
                className={styles.createPool}
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Confirming..." : "Create Pool"}
              </button>
            </div>
          </ul>
        </div>
        <div className={styles.reciept}>
          {hash && <div>Transaction Hash: {hash}</div>}
          {isConfirming && (
            <div className={styles.misc}>Waiting for confirmation...</div>
          )}
          {isConfirmed && (
            <div className={styles.misc}>Transaction confirmed.</div>
          )}
          {isConfirmed && (
            <div>
              {nameA && nameB && (
                <div className={styles.misc}>
                  {nameA}/{nameB} pool created
                </div>
              )}
            </div>
          )}
          {poolAddress && (
            <div className={styles.pooladdress}>
              Pool Address: {poolAddress}
            </div>
          )}
          {error && (
            <div>
              Error: {(error as BaseError).shortMessage || error.message}
            </div>
          )}
        </div>
      </ul>
    </form>
  );
}
