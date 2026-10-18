// import React, { useEffect, useState } from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(null);

//   useEffect(() => {
//     const checkToken = async () => {
//       const token = localStorage.getItem('token');

//       if (!token) {
//         setIsAuthenticated(false);
//         return;
//       }

//       try {
//         const jwt_decode = (await import('jwt-decode')).default;
//         const decoded = jwt_decode(token);

//         if (decoded.exp * 1000 < Date.now()) {
//           localStorage.removeItem('token');
//           setIsAuthenticated(false);
//         } else {
//           setIsAuthenticated(true);
//         }
//       } catch (error) {
//         console.error('Invalid token:', error);
//         localStorage.removeItem('token');
//         setIsAuthenticated(false);
//       }
//     };

//     checkToken();
//   }, []);

//   if (isAuthenticated === null) {
//     return null; // แสดงหน้าโหลด หรือค้างไว้ก่อนที่จะแสดงผล
//   }

//   return isAuthenticated ? children : <Navigate to="/login" />;
// };

// export default ProtectedRoute;
