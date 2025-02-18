// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth'; // Import useAuthState
import { auth } from '../firebaseConfig'; // Correct relative path

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth); // Use useAuthState hook

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking auth
  }

  if (!user) {
    return <Navigate to="/login" />; // Redirect to login if user is not authenticated
  }

  return children; // Render the protected component if user is authenticated
};

export default ProtectedRoute;