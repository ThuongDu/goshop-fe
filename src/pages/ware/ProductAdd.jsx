import React, { useState } from 'react';
import axios from 'axios';

const ProductAdd = () => {
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    description: '',
    weight: '',
    unit: '',
    sale_price: '',
    image: null 
  });
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
      setError('Vui lòng nhập tên sản phẩm, giá và chọn ảnh');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('description', form.description);
      formData.append('weight', form.weight);
      formData.append('unit', form.unit);
      formData.append('sale_price', form.sale_price || '0');
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
      setForm({ 
        name: '', 
        price: '', 
        description: '',
        weight: '',
        unit: '',
        sale_price: '',
        image: null 
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Lỗi thêm sản phẩm:', err);
      setError(err.response?.data?.message || 'Lỗi thêm sản phẩm');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(value);
  };

  return (
    <div className="w-full text-sm">
      <div className="flex mx-5 my-5 gap-4">
        <div className="w-full bg-white p-6 rounded-lg shadow-md">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Cột 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nhập tên sản phẩm"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Giá bán *</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Nhập giá bán"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Giá khuyến mãi</label>
                  <input
                    type="number"
                    name="sale_price"
                    placeholder="Nhập giá khuyến mãi"
                    value={form.sale_price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Hình ảnh *</label>
                  <input
                    type="file"
                    onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              {/* Cột 2 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    placeholder="Nhập mô tả sản phẩm"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Trọng lượng</label>
                    <input
                      type="number"
                      name="weight"
                      placeholder="0.00"
                      value={form.weight}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Đơn vị tính</label>
                    <select
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Chọn đơn vị</option>
                      <option value="g">Gram (g)</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="ml">Mililiter (ml)</option>
                      <option value="l">Liter (l)</option>
                      <option value="cái">Cái</option>
                      <option value="hộp">Hộp</option>
                      <option value="chai">Chai</option>
                      <option value="túi">Túi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
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