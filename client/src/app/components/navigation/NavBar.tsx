"use client";

import Link from "next/link";
import styles from "./NavBar.module.css";
import useMetamask from "../connection/useMetamask";

export default function NavBar() {
  const { connect, disconnect, address, connected } = useMetamask();

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const handleButtonClick = () => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <ul className={styles.ul}>
          <li>
            <Link legacyBehavior href="/" passHref>
              <a className={styles.name}>
                🔥<span className={styles.highlight}>Flare</span>
                {""}Swap
              </a>
            </Link>
          </li>
          <li>
            <Link legacyBehavior href="/tutorial" passHref>
              <a className={styles.link}>Tutorial</a>
            </Link>
          </li>
          <li>
            <Link legacyBehavior href="/create-pool" passHref>
              <a className={styles.link}>Create Pool</a>
            </Link>
          </li>
        </ul>
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={handleButtonClick}>
            {connected ? shortenAddress(address) : "Connect"}
          </button>
        </div>
      </div>
    </nav>
  );
}
