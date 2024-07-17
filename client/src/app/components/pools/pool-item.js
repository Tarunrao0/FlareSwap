import Link from "next/link";
import styles from "./pool-item.module.css";

export default function PoolItem({ token1Name, token2Name, slug }) {
  return (
    <>
      <Link className={styles.link} href={`/${slug}`}>
        <div className={styles.box}>
          <ul>
            <p className={styles.p}>{token1Name}/</p>
            <p className={styles.p}>{token2Name}</p>
          </ul>
        </div>
      </Link>
    </>
  );
}
