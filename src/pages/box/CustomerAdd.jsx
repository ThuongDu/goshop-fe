import React, { useState } from 'react';
import axios from 'axios';

const CustomerAdd = () => {
  const [form, setForm] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.phone) {
      setError('Vui lòng nhập đầy đủ tên và số điện thoại');
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone)) {
      setError('Số điện thoại phải gồm đúng 10 chữ số');
      return;
    }

    try {
      await axios.post(
        'http://localhost:3000/api/customers',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Thêm khách hàng thành công!');
      setForm({ name: '', phone: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi thêm khách hàng');
    }
  };

  return (
    <div className="fw-full text-sm">
      <div className="max-h-20 bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Thêm khách hàng</h1>
      </div>

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-blue-800 text-white text-left border-b border-gray-300">
                <td className="px-2 py-1 w-1/2">Tên khách hàng:</td>
                <td className="px-2 py-1 w-1/2">Số điện thoại:</td>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-300">
                <td className="px-1 py-1">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Nhập tên khách hàng"
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Nhập số điện thoại"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-center mt-5">
            <button
              type="submit"
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-6 rounded shadow"
            >
              + Thêm khách hàng
            </button>
          </div>
        </form>
      </div>
  </div>
  );
};

export default CustomerAdd;
