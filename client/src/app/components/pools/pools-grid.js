import PoolItem from "./pool-item";
import styles from "./pool-grid.module.css";

export default function PoolsGrid({ pools }) {
  return (
    <div className={styles.gridPlacement}>
      <ul className={styles.poolList}>
        {pools.map((pool) => (
          <li key={pool.id}>
            <PoolItem {...pool} />
          </li>
        ))}
      </ul>
    </div>
  );
}
