import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
// FIX 1: Import your premium custom loader instead of the generic lucide icon
import Loader from "./Loader"; 

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_NODE_URL}/api/admin/verify`,
          {
            method: "GET",
            credentials: "include", // Essential for reading auth cookies
          }
        );

        // FIX 2: Manually check if the response is unauthorized/failed
        // Fetch does NOT throw errors for 401 status codes automatically
        if (!response.ok) {
          setIsAuthenticated(false);
          return;
        }

        const data = await response.json();
        
        // Securely cast the result to a strict boolean
        setIsAuthenticated(!!data.isLoggedIn);

      } catch (error) {
        // This only catches absolute network failures (e.g., server down, no internet)
        console.error("Auth verification failed:", error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      // FIX 3: Replaced the basic spinner with your premium brand loader
      // Changed min-h-screen to min-h-[100dvh] for mobile safety
      <div className="flex items-center justify-center min-h-[100dvh] bg-warm-ivory">
        <Loader size="lg" color="#C9A24D" />
      </div>
    );
  }

  // If authenticated, render the nested admin routes. If not, kick them out.
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/admin-portal-secret" replace />
  );
};

export default ProtectedRoute;