// ProtectedRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem('token');
  return (
    <Route
      {...rest}
      element={token ? <Component {...rest} /> : <Navigate to="/login" />}
    />
  );
};

export default ProtectedRoute;
