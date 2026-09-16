export default function Spinner({ label = "Loading…", className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-10 text-midnight-700 ${className}`}>
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-midnight-200 border-t-gold-500"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
