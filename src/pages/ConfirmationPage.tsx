import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

export default function ConfirmationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <Header />
      </div>
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-4">
            <span aria-hidden="true" className="mr-3 text-3xl">
              ✅
            </span>
            Booking Received!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your booking has been created. The venue will confirm it soon. You
            can follow its status, or cancel it, under My bookings.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            Book Another Venue
          </button>
          <button
            onClick={() => navigate('/my-bookings')}
            className="ml-4 text-indigo-700 font-bold hover:underline cursor-pointer"
          >
            View my bookings
          </button>
        </div>
      </div>
    </div>
  );
}
