import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/customers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(res.data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách khách hàng');
      }
    };
    fetchCustomers();
  }, [token]);

  const handleDelete = async (id) => {
    const confirm = window.confirm('Bạn có chắc muốn xoá khách hàng này không?');
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:3000/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(customers.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Xoá thất bại');
    }
  };

  return (
    <div className="w-full text-sm">
      <div className="max-h-20 bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Danh sách khách hàng</h1>
      </div>

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-3">{error}</p>}
        {customers.length === 0 ? (
          <p className="text-gray-600">Chưa có khách hàng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
                  <th className="px-2 py-1 w-[5%]">ID</th>
                  <th className="px-2 py-1 w-[30%]">Tên</th>
                  <th className="px-2 py-1 w-[25%]">Số điện thoại</th>
                  <th className="px-2 py-1 w-[25%]">Ngày tạo</th>
                  <th className="px-2 py-1 w-[15%]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, index) => (
                  <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-2 py-1">{index + 1}</td>
                    <td className="px-2 py-1">{c.name}</td>
                    <td className="px-2 py-1">{c.phone}</td>
                    <td className="px-2 py-1">
                      {new Date(c.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </td>
                    <td className="px-2 py-1">
                      <button
                        onClick={() => alert(`Sửa danh mục ID: ${c.id}`)}
                        className="text-blue-600 font-semibold px-1"
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {handleDelete(c.id)}}
                        className="text-red-600 font-semibold px-1"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
