"use server";

import { getPoolBySlug } from "../../../lib/pools";
import PoolPage from "./PoolPage";

export default async function Page({ params }) {
  const { slug } = params;
  const poolData = await getPoolBySlug(slug);

  if (!poolData) {
    return <div>Pool not found</div>;
  }

  return <PoolPage poolData={poolData} />;
}
