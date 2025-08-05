import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

const CategoryListByWarehouse = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [categories, setCategories] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

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

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDelete = async (categoryId) => {
    try {
      await axios.delete(`http://localhost:3000/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Lỗi khi xoá danh mục:', err);
      alert('Xoá thất bại');
    }
  };

  return (
    <div className="container mx-auto text-sm">
      <div className="mx-5 mt-5 p-6 bg-white rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="warehouse" className="block font-medium text-gray-700 mb-1">
            Chọn kho
          </label>
          <select
            id="warehouse"
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Chọn kho --</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
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
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-2 py-1">
                    <button
                      onClick={() => navigate(`/AdminHome/Category/edit/${cat.id}`)}
                      className="text-blue-600 font-semibold px-1"
                      title="Sửa"
                    >
                      <FaEdit className="inline" />
                    </button>
                    <button
                      onClick={() => confirmDelete(cat)}
                      className="text-red-600 font-semibold px-2"
                      title="Xóa"
                    >
                      <FaTrash className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center my-10">
            {selectedWarehouseId ? 'Không có danh mục nào trong kho này.' : 'Vui lòng chọn kho để xem danh mục.'}
          </p>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc muốn xóa danh mục{' '}
                <span className="font-semibold">{categoryToDelete?.name}</span> và các sản phẩm liên quan không?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(categoryToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryListByWarehouse;
