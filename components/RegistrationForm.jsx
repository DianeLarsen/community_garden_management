"use client";
import { useState, useContext } from 'react';
import { BasicContext } from "@/context/BasicContext";
import { useRouter } from 'next/navigation';

const RegistrationForm = () => {
  const { showBanner } = useContext(BasicContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [data, setData] = useState();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setData({ error: 'Passwords do not match' });
      return;
    }

    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const results = await response.json();
      if (response.ok) {
        showBanner("Registration successful! Check Email!", "success");
        router.push('/');
      } else {
        setData(results);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setData({ error: 'An unexpected error occurred. Please try again later.' });
    }
  };

  return (
    <div className="flex items-center justify-center max-h-screen p-8 bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-3xl mb-4">Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded">
            Register
          </button>
        </form>
        {data && <p className="mt-4 text-red-600">{data.error || data.message}</p>}
      </div>
    </div>
  );
};

export default RegistrationForm;
