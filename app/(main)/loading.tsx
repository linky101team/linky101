function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-[18px] border-3 border-border bg-card" />;
}

export default function MainLoading() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
