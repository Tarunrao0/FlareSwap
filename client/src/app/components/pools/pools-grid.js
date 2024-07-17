import PoolItem from "./pool-item";

export default function PoolsGrid({ pools }) {
  return (
    <ul>
      {pools.map((pool) => (
        <div key={pool.id}>
          <PoolItem {...pool} />
        </div>
      ))}
    </ul>
  );
}
