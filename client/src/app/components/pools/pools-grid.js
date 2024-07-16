import PoolItem from "./pool-item";

export default function PoolsGrid({ pools }) {
  return (
    <ul>
      {pools.map((pool) => (
        <li key={pool.id}>
          <PoolItem {...pool} />
        </li>
      ))}
    </ul>
  );
}
