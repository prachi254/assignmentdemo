export default function Loader({ label = "Loading...", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink/70">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" aria-hidden="true" />
      <p className="text-sm">{label}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="rounded-md bg-warn px-4 py-2 text-sm font-medium text-white hover:bg-warn/90">
          Retry
        </button>
      )}
    </div>
  );
}
