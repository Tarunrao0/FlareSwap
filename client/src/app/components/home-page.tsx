import { getPools } from "../../../lib/pools";
import PoolsGrid from "./pools/pools-grid";

export default async function HomePage() {
  const pools = await getPools();
  return (
    <>
      <PoolsGrid pools={pools} />
    </>
  );
}
