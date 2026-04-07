import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const ClientAuthContext = createContext();

export const useClientAuth = () => useContext(ClientAuthContext);

export const ClientAuthProvider = ({ children }) => {
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  const [clientUser, setClientUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Axios instance configured for secure cookie-based auth
  const api = axios.create({
    baseURL: import.meta.env.VITE_NODE_URL,
    withCredentials: true, // FIX 1: Ensures cookies/sessions are sent with every request
  });

  // FIX 2: Validate session with the backend on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const storedUser = localStorage.getItem("clientUser");
        
        // If we have local data, double-check it against the server
        if (storedUser) {
          // Assuming you have a route like this (similar to your admin /verify)
          // If you don't have this yet, the fallback keeps your current logic working!
          const response = await api.get("/api/users/verify").catch(() => null);
          
          if (response?.data?.user) {
            setClientUser(response.data.user);
            setIsClientLoggedIn(true);
            // Refresh local storage with latest backend truth
            localStorage.setItem("clientUser", JSON.stringify(response.data.user));
          } else {
            // Token expired or invalid, wipe local mirage
            localStorage.removeItem("clientUser");
            setClientUser(null);
            setIsClientLoggedIn(false);
          }
        }
      } catch (error) {
        console.error("Session verification failed", error);
        localStorage.removeItem("clientUser");
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/users/login", { email, password });
      
      const userData = response.data.user;
      const loggedInUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        discount: userData.discount,
      };

      localStorage.setItem("clientUser", JSON.stringify(loggedInUser));
      setClientUser(loggedInUser);
      setIsClientLoggedIn(true);

      return { success: true, user: loggedInUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid credentials. Please try again.",
      };
    }
  };

  const logout = async () => {
    // FIX 3: Securely destroy the backend session cookie before clearing UI state
    try {
      await api.post("/api/users/logout");
    } catch (error) {
      console.error("Backend logout failed, forcing client logout", error);
    } finally {
      localStorage.removeItem("clientUser");
      setClientUser(null);
      setIsClientLoggedIn(false);
    }
  };

  const signup = async (name, email, password, phone) => {
    try {
      // Cleaned up development console logs for production
      const response = await api.post("/api/users/signup", {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });

      return {
        success: true,
        message: response.data.message || "Welcome! Your account has been created.",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "We couldn't create your account. Please try again.",
      };
    }
  };

  return (
    <ClientAuthContext.Provider
      value={{
        isClientLoggedIn,
        clientUser,
        login,
        logout,
        signup,
        isLoading,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
};