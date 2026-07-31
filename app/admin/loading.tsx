function SkeletonRow() {
  return <div className="h-16 animate-pulse rounded-[18px] border-3 border-border bg-card" />;
}

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-3">
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  );
}
