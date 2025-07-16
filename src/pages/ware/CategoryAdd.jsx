import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CategoryAdd = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ name: '', warehouse_id: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:3000/api/warehouses', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setWarehouses(res.data))
      .catch(() => setError('Không thể tải danh sách kho'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('token');

    if (!form.name || !form.warehouse_id) {
      setError('Vui lòng nhập đầy đủ');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/categories', form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Thêm danh mục thành công!');
      setForm({ name: '', warehouse_id: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Lỗi khi thêm danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fw-full text-sm">
      <div className="max-h-20 bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Thêm danh mục</h1>
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
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
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
              {loading ? 'Đang thêm...' : '+ Thêm danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryAdd;
