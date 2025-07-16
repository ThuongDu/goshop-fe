import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CategoryEdit = () => {
  const { id } = useParams();               
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ name: '', warehouse_id: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    if (!id) return;

    axios.get(`http://localhost:3000/api/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
    setForm({
        name: res.data.name,
        warehouse_id: res.data.warehouse_id
    });
    })
    .catch(() => setError('Không thể tải thông tin danh mục'));

    // Lấy danh sách kho
    axios.get('http://localhost:3000/api/warehouses', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setWarehouses(res.data))
    .catch(() => setError('Không thể tải danh sách kho'));
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!form.name || !form.warehouse_id) {
      setError('Vui lòng nhập đầy đủ');
      setLoading(false);
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/categories/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Cập nhật danh mục thành công!');
      setTimeout(() => {
        setSuccess('');
        navigate('/AdminHome/Category/list');   
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi cập nhật danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fw-full text-sm">
      <div className="max-h-20 bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Cập nhật danh mục</h1>
      </div>

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-blue-800 text-white text-left border-b border-gray-300">
                <th className="px-2 py-1 w-1/2">Tên danh mục</th>
                <th className="px-2 py-1 w-1/2">Kho</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-300">
                <td className="px-1 py-1">
                  <input
                    type="text"
                    placeholder="Nhập tên danh mục"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </td>
                <td className="px-1 py-1">
                  <select
                    value={form.warehouse_id}
                    onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Chọn kho --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-center mt-5">
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-6 rounded-lg shadow-md ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEdit;
