import { getPools } from "../../../lib/pools";
import PoolsGrid from "./pools/pools-grid";
import styles from "./home-page.module.css";
import { Rubik_Mono_One } from "next/font/google";
import Image from "next/image";
import mainpage from "../../../public/mainpage.png";

const rubik = Rubik_Mono_One({
  weight: "400",
  subsets: ["latin"],
});

export default async function HomePage() {
  const pools = await getPools();
  return (
    <>
      <div className={styles.positioning}>
        <div className={styles.headerContainer}>
          <h1 className={rubik.className}>
            <span>Dive</span>
            <span>into</span>
            <span>token pools</span>
          </h1>
          <div className={styles.imageContainer}>
            <Image alt="ethereum" src={mainpage} priority />
          </div>
        </div>
      </div>
      <PoolsGrid pools={pools} />
    </>
  );
}
