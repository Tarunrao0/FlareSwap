import { useReadContract } from "wagmi";
import { mockUsdcAddress, mockUsdcAbi } from "../constants/constant";

export default function ReadContract() {
  const {
    data: balance,
    error,
    isPending,
  } = useReadContract({
    address: mockUsdcAddress,
    abi: mockUsdcAbi,
    functionName: "balanceOf",
    args: ["0x77c359f1f0334E706aeFC613DE6f417d175Ad408"],
  });

  if (isPending) return <div>Loading...</div>;

  if (error) return <div> Error: {error.message}</div>;
  return <div>Balance: {balance?.toString()}</div>;
}
