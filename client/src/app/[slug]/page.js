import { getPoolBySlug } from "../../../lib/pools";
import styles from "./page.module.css";

export default function PoolPage({ params }) {
  const { slug } = params;
  const poolData = getPoolBySlug(slug);

  if (!poolData) {
    console.error("Pool not found for slug:", slug);
    return <div>Pool not found</div>;
  }

  console.log("Pool Data:", poolData);

  return (
    <div className={styles.main}>
      <h1>Pool Page for {slug}</h1>
      <p>Pool Address: {poolData.poolAddress}</p>
      <p>
        Token 1: {poolData.token1Name}: {poolData.token1Address}
      </p>
      <p>
        Token 2: {poolData.token2Name} ({poolData.token2Address})
      </p>
    </div>
  );
}
