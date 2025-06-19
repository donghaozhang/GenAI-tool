import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="text-center space-y-6 max-w-md p-8">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300">Page Not Found</h2>
        <p className="text-gray-400">The page you're looking for doesn't exist in our AI marketplace.</p>
        <div className="flex flex-col gap-4 mt-8">
          <Button 
            onClick={() => navigate('/marketplace')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Go to AI Marketplace
          </Button>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="border-gray-400 text-gray-300 hover:bg-gray-800 px-8 py-3"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
