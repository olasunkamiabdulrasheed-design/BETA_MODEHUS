import { Link } from "react-router-dom";

export default function EmptyState({ title, description, actionLabel, actionTo, icon = "✦" }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-midnight-200 bg-white/60 px-6 py-14 text-center">
      <div className="text-4xl text-midnight-300">{icon}</div>
      <h2 className="font-display mt-3 text-xl font-bold text-midnight-900">{title}</h2>
      {description && <p className="mt-2 text-sm text-midnight-700">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-gold mt-5">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
