import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Header({
  showAuthLinks = true,
}: {
  showAuthLinks?: boolean;
}) {
  const { user, initialized, logout } = useAuthStore();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `font-bold hover:underline ${
      isActive ? 'text-indigo-500 underline' : 'text-indigo-800'
    }`;

  const logo = (
    <Link
      to="/"
      className="text-xl font-bold text-gray-900 hover:text-indigo-700"
    >
      🎳 Venue Booking
    </Link>
  );

  // Keep the header's height while the session loads, so the page doesn't jump
  if (!initialized) {
    return <div className="flex items-center mb-8 h-10">{logo}</div>;
  }

  // The home page is public, so visitors need a way to log in or register
  if (!user) {
    // The login and register pages already are the auth links
    if (!showAuthLinks)
      return <div className="flex items-center mb-8 h-10">{logo}</div>;
    return (
      <div className="flex justify-between items-center gap-4 mb-8 h-10">
        {logo}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-indigo-700 font-bold hover:underline"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center gap-4 mb-8 h-10">
      {logo}
      <div className="flex items-center gap-4">
        {user.role === 'owner' && (
          <NavLink to="/owner/bookings" className={linkClass}>
            Incoming bookings
          </NavLink>
        )}
        <NavLink to="/my-bookings" className={linkClass}>
          My bookings
        </NavLink>
        <span className="text-gray-700">
          Hi, <strong>{user.name}</strong>
        </span>
        <button
          onClick={() => logout().catch(console.error)}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
