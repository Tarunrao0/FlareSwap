"use server";

import { savePool } from "./pools";

export async function updatePool(
  nameA,
  nameB,
  poolAddress,
  token1Address,
  token2Address
) {
  const pool = {
    name: `${nameA}/${nameB}`,
    slug: `${nameA}-${nameB}`,
    poolAddress: `${poolAddress}`,
    token1Name: `${nameA}`,
    token2Name: `${nameB}`,
    token1Address: `${token1Address}`,
    token2Address: `${token2Address}`,
  };

  console.log(pool);

  await savePool(pool);
}
