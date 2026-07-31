export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy">
      <div className="flex flex-col items-center gap-3">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-pink border-t-transparent" />
        <p className="text-xs font-black uppercase tracking-wide text-text-muted">Loading LinkY101...</p>
      </div>
    </div>
  );
}
