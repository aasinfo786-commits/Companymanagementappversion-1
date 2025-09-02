// 📁 src/pages/NotFound.jsx
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Page not found</p>
      <Link 
        to="/" 
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;