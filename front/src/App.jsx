// front/screen/App.jsx
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import axios from 'axios';
import FrmMainIpd from './components/FrmMainIpd';
import Login from './login/Login';

import { API_URL } from '../config';

function PrivateRoute({ element }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const verifyToken = async () => {
      try {
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const response = await axios.get(API_URL + '/api/auth', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        setIsAuthenticated(false);
      }
    };

    verifyToken();

    // Add event listener to watch for localStorage changes
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token');
      if (!newToken) {
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // คุณสามารถใส่ loading spinner ได้ที่นี่
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<PrivateRoute element={<FrmMainIpd />} />} />
      </Routes>
    </Router>
  );
}

export default App;
