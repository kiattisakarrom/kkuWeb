import React, { useState } from 'react';
import axios from 'axios';

import { API_URL } from '../../config';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    f_name: '',
    l_name: '',
    position: '',
    Department: '',
    Room: '',
    Username: '',
    Password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.Password !== formData.confirmPassword) {
      alert('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    try {
      const response = await axios.post(API_URL + '/register', formData);
      alert(response.data);
    } catch (err) {
      alert(err.response.data);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen pt-24 bg-center">
      <div className="bg-white bg-opacity-90 p-10 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-5 mt-20 text-center">ลงทะเบียน</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="name">
              ชื่อ
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="f_name">
              นามสกุล
            </label>
            <input
              type="text"
              id="f_name"
              name="f_name"
              value={formData.f_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="l_name">
              สกุล
            </label>
            <input
              type="text"
              id="l_name"
              name="l_name"
              value={formData.l_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="position"
            >
              ตำแหน่ง
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="Department"
            >
              แผนก
            </label>
            <input
              type="text"
              id="Department"
              name="Department"
              value={formData.Department}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="Room">
              ห้อง
            </label>
            <select
              id="Room"
              name="Room"
              value={formData.Room}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="">เลือกห้อง</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="guest">Guest</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="Username"
            >
              Username
            </label>
            <input
              type="text"
              id="Username"
              name="Username"
              value={formData.Username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="Password"
            >
              Password
            </label>
            <input
              type="password"
              id="Password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="profile-picture"
            >
              รูปภาพ
            </label>
            <input
              type="file"
              id="profile-picture"
              name="profile-picture"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="w-32 bg-green-500 text-white py-2 rounded hover:bg-green-600 focus:outline-none focus:bg-green-600"
            >
              ลงทะเบียน
            </button>
            <button
              type="reset"
              className="w-32 bg-red-500 text-white py-2 rounded hover:bg-red-600 focus:outline-none focus:bg-red-600"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
