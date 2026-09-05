import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-bm py-20 text-center">
      <div className="font-display text-6xl font-bold text-gold-500">404</div>
      <p className="mt-3 text-midnight-700">The page you are looking for doesn't exist.</p>
      <Link to="/" className="btn-gold mt-6">
        Back to home
      </Link>
    </div>
  );
}