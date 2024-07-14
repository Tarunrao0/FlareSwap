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
  mockUsdcAbi,
} from "../constants/constant";
import { publicClient } from "./client";

interface PoolCreatedEventArgs {
  pool: string;
  token1: string;
  token2: string;
}

export default function CreatePool() {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const [poolAddress, setPoolAddress] = useState("");
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");

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
      }
    },
  });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const tokenA = formData.get("tokenA") as string;
    const tokenB = formData.get("tokenB") as string;

    const sym1 = await publicClient.readContract({
      address: tokenA as `0x${string}`,
      abi: mockUsdcAbi,
      functionName: "symbol",
    });

    const sym2 = await publicClient.readContract({
      address: tokenB as `0x${string}`,
      abi: mockUsdcAbi,
      functionName: "symbol",
    });

    setNameA(sym1 as string);
    setNameB(sym2 as string);
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
        <h1>Create a custom pool </h1>

        <h3>TOKEN A</h3>
        <label>Address</label>
        <input name="tokenA" required />

        <h3>TOKEN B</h3>

        <label>Address</label>
        <input name="tokenB" required />

        <button disabled={isPending} type="submit">
          {isPending ? "Confirming..." : "Create Pool"}
        </button>
        {hash && <div>Transaction Hash: {hash}</div>}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
        {isConfirmed && (
          <div>
            {nameA && nameB && (
              <div>
                {nameA}/{nameB} pool created
              </div>
            )}
          </div>
        )}
        {poolAddress && <div>Pool Address: {poolAddress}</div>}
        {error && (
          <div>Error: {(error as BaseError).shortMessage || error.message}</div>
        )}
      </ul>
    </form>
  );
}
