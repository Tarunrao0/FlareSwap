import Link from "next/link";

export default function PoolItem({ name, slug }) {
  return (
    <>
      <Link href={`/${slug}`}>
        <div>
          <p>{name} Pool</p>
        </div>
      </Link>
    </>
  );
}
