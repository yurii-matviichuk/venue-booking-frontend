import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Header() {
  const { user, initialized, logout } = useAuthStore();

  // Keep the header's height while the session loads, so the page doesn't jump
  if (!initialized) return <div className="mb-8 h-10" />;

  // The home page is public, so visitors need a way to log in or register
  if (!user) {
    return (
      <div className="flex justify-end items-center gap-4 mb-8 h-10">
        <Link to="/login" className="text-indigo-700 font-bold hover:underline">
          Log in
        </Link>
        <Link
          to="/register"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-end items-center gap-4 mb-8 h-10">
      <Link
        to="/my-bookings"
        className="text-indigo-700 font-bold hover:underline"
      >
        My bookings
      </Link>
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
  );
}
