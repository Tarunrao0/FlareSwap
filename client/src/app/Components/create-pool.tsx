import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { poolDeployerAddress, poolDeployerAbi } from "../constants/constant";
import { useEffect, useState } from "react";

export default function CreatePool() {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const [poolAddress, setPoolAddress] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const tokenA = formData.get("tokenA") as string;
    const tokenB = formData.get("tokenB") as string;
    writeContract({
      address: poolDeployerAddress,
      abi: poolDeployerAbi,
      functionName: "createPool",
      args: [tokenA, tokenB],
    });
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const { data: poolData, error: poolError } = useWatchContractEvent({
    address: poolDeployerAddress,
    abi: poolDeployerAbi,
    eventName: "PoolCreated",
  });

  useEffect(() => {
    if (poolData) {
      setPoolAddress(poolData.args[2]);
    }
  }, [poolData]);

  return (
    <form onSubmit={submit}>
      <ul>
        <h1>Enter token addresses to create a custom pool </h1>

        <label>TOKEN A </label>
        <input name="tokenA" required />

        <label>TOKEN B </label>
        <input name="tokenB" required />

        <button disabled={isPending} type="submit">
          {isPending ? "Confirming..." : "Create Pool"}
        </button>
        {hash && <div>Transaction Hash: {hash}</div>}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
        {error && (
          <div>Error: {(error as BaseError).shortMessage || error.message}</div>
        )}
        {poolError && (
          <div>
            {" "}
            Error: {(poolError as BaseError).shortMessage || poolError.message}
          </div>
        )}
        {poolAddress && <div>Pool Address: {poolAddress}</div>}
      </ul>
    </form>
  );
}
