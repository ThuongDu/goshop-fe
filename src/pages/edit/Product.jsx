import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', price: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetching(true);
        const res = await axios.get(`http://localhost:3000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm({ name: res.data.name, price: res.data.price });
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.price) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      await axios.put(`http://localhost:3000/api/products/${id}`, {
        name: form.name,
        price: form.price,
        updated_by: userId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Cập nhật sản phẩm thành công!');
      setTimeout(() => navigate('/AdminHome/Product/list'), 2000);
    } catch (err) {
      console.error('Lỗi cập nhật sản phẩm:', err);
      setError('Lỗi cập nhật sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p className="p-4 text-gray-700">Đang tải thông tin sản phẩm...</p>;
  }

  return (
    <div className="w-full text-sm">
      <div className="max-h-20 bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Cập nhật sản phẩm</h1>
      </div>

      <div className="flex mx-5 my-5 gap-4">
        <div className="w-full bg-white p-6 rounded-lg shadow-md">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          <form onSubmit={handleSubmit}>
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-blue-800 text-white text-left border-b border-gray-300">
                  <th className="px-2 py-1 w-[50%]">Tên sản phẩm</th>
                  <th className="px-2 py-1 w-[50%]">Giá</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-300">
                  <td className="px-1 py-1">
                    <input
                      type="text"
                      placeholder="Nhập tên sản phẩm"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      placeholder="Nhập giá"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-6 rounded-lg shadow-md ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;
