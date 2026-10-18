import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // เพิ่ม useNavigate

import { API_URL } from '../../config';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // ใช้ useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL + '/api/login', {
        username,
        password,
      });
      setMessage('เข้าสู่ระบบสำเร็จ');
      localStorage.setItem('token', response.data.token);
      navigate('/'); // นำทางไปที่หน้า mainIPD หลังจากการล็อกอินสำเร็จ
    } catch (err) {
      setMessage('รหัสผ่านหรือชื่อไม่ถูกต้อง');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full bg-center">
      <div className="bg-white bg-opacity-90 p-10 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-5 text-center">เข้าสู่ระบบ</h2>
        {message && (
          <div className="mb-4 text-center text-red-500">{message}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="username"
            >
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="password"
            >
              รหัสผ่าน
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="border border-gray-300 rounded p-2 my-5">
            <select className="w-full border-none focus:outline-none" required>
              <option>(กรุณาเลือกห้อง)</option>
              <option>ห้องที่ 1</option>
              <option>ห้องที่ 2</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 focus:outline-none focus:bg-green-600"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
