import { useNavigate } from 'react-router-dom';

export default function ConfirmationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-4xl font-bold mb-4">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your booking has been successfully created. Check your email for
            confirmation details.
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
