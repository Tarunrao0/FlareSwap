import { useEffect, useState } from "react";
import { ethers } from "ethers";

function useMetamask() {
  const [address, setAddress] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  });

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && address !== accounts[0]) {
      setAddress(accounts[0]);
    } else {
      setConnected(false);
      setAddress(null);
    }
  }

  async function connect() {
    if (!window.ethereum) {
      setError("MetaMask is not installed");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = provider.getSigner();
      const connectedAddress = await signer.getAddress();
      setAddress(connectedAddress);
      setConnected(true);
      setError(null);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      setError(error.message || error.toString());
    }
  }

  async function disconnect() {
    if (!window.ethereum) {
      setError("MetaMask is not installed");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setConnected(false);
      setAddress(null);
      setError(null);
    } catch (error) {
      console.error("Error disconnecting from wallet:", error);
      setError(error.message || error.toString());
    }
  }

  return {
    connect,
    disconnect,
    address,
    connected,
    error,
  };
}

export default useMetamask;
