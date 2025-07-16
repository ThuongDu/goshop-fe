import React, { useState } from 'react';
import axios from 'axios';

const ProductAdd = () => {
  const [form, setForm] = useState({ name: '', price: '', image: null });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.price || !form.image) {
      setError('Vui lòng nhập đầy đủ thông tin và chọn ảnh');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('created_by', userId);
      formData.append('updated_by', userId);
      formData.append('image', form.image);

      await axios.post('http://localhost:3000/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Thêm sản phẩm thành công!');
      setForm({ name: '', price: '', image: null });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Lỗi thêm sản phẩm:', err);
      setError('Lỗi thêm sản phẩm');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full text-sm">
      <div className="max-h-20 bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Thêm sản phẩm</h1>
      </div>

      <div className="flex mx-5 my-5 gap-4">
        <div className="w-full bg-white p-6 rounded-lg shadow-md">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          <form onSubmit={handleSubmit}>
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-blue-800 text-white text-left border-b border-gray-300">
                  <th className="px-2 py-1 w-[33%]">Tên sản phẩm</th>
                  <th className="px-2 py-1 w-[33%]">Giá</th>
                  <th className="px-2 py-1 w-[34%]">Hình ảnh</th>
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
                  <td className="px-1 py-1">
                    <input
                      type="file"
                      onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-center mt-4">
              <button
                type="submit"
                disabled={uploading}
                className={`bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-6 rounded-lg shadow-md ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? 'Đang thêm...' : '+ Thêm sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductAdd;
