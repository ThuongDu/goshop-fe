import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CategoryListByWarehouse = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [categories, setCategories] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:3000/api/warehouses', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setWarehouses(res.data));
  }, [token]);

  useEffect(() => {
    if (selectedWarehouseId) {
      axios.get(`http://localhost:3000/api/categories/warehouse/${selectedWarehouseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setCategories(res.data));
    } else {
      setCategories([]);
    }
  }, [selectedWarehouseId, token]);

  const handleDelete = async (categoryId) => {
    const confirmDelete = window.confirm('Bạn có chắc muốn xóa danh mục và sản phẩm liên quan không?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3000/api/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories((prev) => prev.filter((category) => category.id !== categoryId));
    } catch (err) {
      console.error('Lỗi khi xoá danh mục:', err);
      alert('Xoá thất bại');
    }
  };

  return (
    <div className="w-full text-sm">
      <div className="max-h-20 bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5 px-5">Danh sách danh mục</h1>
      </div>

      <div className="mx-5 mt-5 p-6 bg-white rounded-lg shadow-md">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
              <th className="px-2 py-1">Chọn kho</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-300">
              <td className="px-1 py-1">
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Chọn kho --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {categories.length > 0 ? (
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
                <th className="px-2 py-2 w-[5%]">ID</th>
                <th className="px-2 py-2 w-[45%]">Tên danh mục</th>
                <th className="px-2 py-2 w-[35%]">Ngày tạo</th>
                <th className="px-2 py-2 w-[15%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-2 py-1">{index + 1}</td>
                  <td className="px-2 py-1">{cat.name}</td>
                  <td className="px-2 py-1">
                    {new Date(cat.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric'
                    })}
                  </td>
                  <td className="px-2 py-1">
                    <button
                      onClick={() => navigate(`/AdminHome/Category/edit/${cat.id}`)}
                      className="text-blue-600 font-semibold px-1"
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-600 font-semibold px-2"
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center my-10">Chưa có danh mục nào trong kho này.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryListByWarehouse;
