export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-warn/30 bg-warn/5 py-16 text-center">
      <p className="font-medium text-warn">Something went wrong</p>
      <p className="max-w-sm text-sm text-ink/60">{message || "We couldn't load this. Please try again."}</p>
      <button type="button" onClick={onRetry} className="rounded-md bg-warn px-4 py-2 text-sm font-medium text-white hover:bg-warn/90">
        Retry
      </button>
    </div>
  );
}
