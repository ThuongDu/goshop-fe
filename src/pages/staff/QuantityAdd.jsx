import React, { useEffect, useState } from 'react';
import axios from 'axios';

const QuantityAddStaff = () => {
  const token = localStorage.getItem('token');
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({}); // { product_id: { quantity, expiry_date } }
  const [currentQuantities, setCurrentQuantities] = useState({}); // { product_id: [{ quantity, expiry_date }] }
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);

useEffect(() => {
  console.log('Current token:', token);
  const fetchWarehouses = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/staff/warehouses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWarehouses(res.data);
    } catch (err) {
      console.error('Lỗi lấy kho:', err.response?.data || err.message);
      if (err.response?.status === 403) {
        setError('Token hết hạn, vui lòng đăng nhập lại');
      } else {
        setError('Không thể tải danh sách kho');
      }
    }
  };
  fetchWarehouses();
}, [token]);

  useEffect(() => {
    if (selectedWarehouse) {
      const fetchCategories = async () => {
        try {
          const res = await axios.get(`http://localhost:3000/api/categories/warehouse/${selectedWarehouse}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (Array.isArray(res.data)) {
            setCategories(res.data);
          } else {
            console.error('Dữ liệu danh mục không hợp lệ:', res.data);
            setCategories([]);
            setError('Dữ liệu danh mục không hợp lệ từ server');
          }
        } catch (err) {
          console.error('Lỗi lấy danh mục:', err);
          setCategories([]);
          setError('Không thể tải danh sách danh mục');
        }
      };
      fetchCategories();
    } else {
      setCategories([]);
      setSelectedCategory('');
    }
  }, [selectedWarehouse, token]);

useEffect(() => {
  if (selectedCategory && selectedWarehouse) {
    const fetchProductsAndQuantities = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/productcategories/category/${selectedCategory}?warehouseId=${selectedWarehouse}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(res.data);
      } catch (err) {
        console.error('Lỗi API:', err.response?.data || err.message);
        if (err.response?.status === 403) {
          setError('Truy cập bị từ chối, vui lòng đăng nhập lại');
        } else {
          setError(`Lỗi tải sản phẩm: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
        }
      }
    };
    fetchProductsAndQuantities();
  } else {
    setProducts([]);
    setQuantities({});
    setCurrentQuantities({});
  }
}, [selectedCategory, selectedWarehouse, token]);

  const handleChangeQuantity = (productId, field, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: field === 'expiry_date' && !value ? null : value,
      },
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSending(true);

    const itemsToAdd = products
      .filter((p) => quantities[p.id]?.quantity && parseInt(quantities[p.id].quantity) > 0)
      .map((p) => ({
        product_id: p.id,
        image_id: p.images?.[0]?.id || null,
        category_id: selectedCategory,
        warehouse_id: selectedWarehouse,
        quantity: parseInt(quantities[p.id].quantity),
        expiry_date: quantities[p.id]?.expiry_date || null,
      }));

    if (!selectedWarehouse || !selectedCategory || itemsToAdd.length === 0) {
      setError('Vui lòng chọn kho, danh mục, và nhập số lượng hợp lệ');
      setSending(false);
      return;
    }

    try {
      await Promise.all(
        itemsToAdd.map((item) =>
          axios.post('http://localhost:3000/api/staff/quantity', item, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setSuccess('✔️ Thêm số lượng thành công!');
      setQuantities({});
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '❌ Thêm số lượng thất bại');
    } finally {
      setSending(false);
    }
  };

  // Định dạng ngày
  const formatDate = (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'Không giới hạn');

  // Tính tổng số lượng theo hạn sử dụng
  const getTotalByExpiry = (productId, expiryDate) => {
    const quantities = currentQuantities[productId] || [];
    return quantities
      .filter((q) => q.expiry_date === expiryDate)
      .reduce((sum, q) => sum + q.quantity, 0);
  };

  return (
    <div className="w-full text-sm">
      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-blue-800 text-white text-left border-b border-gray-300">
                <th className="px-2 py-2 w-1/2">Kho</th>
                <th className="px-2 py-2 w-1/2">Danh mục</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-300">
                <td className="px-1 py-1">
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn kho --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-1 py-1">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full table-fixed mt-4">
            <thead>
              <tr className="bg-blue-800 text-white text-left border-b border-gray-300">
                <th className="px-2 py-2 w-[25%]">Tên sản phẩm</th>
                <th className="px-2 py-2 w-[15%]">Ảnh</th>
                <th className="px-2 py-2 w-[25%]">Tồn kho hiện tại</th>
                <th className="px-2 py-2 w-[15%]">Nhập thêm</th>
                <th className="px-2 py-2 w-[20%]">Hạn sử dụng</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-gray-300">
                  <td className="px-1 py-1">{product.name}</td>
                  <td className="px-1 py-1">
                    {product.images?.length > 0 ? (
                      <img
                        src={`http://localhost:3000/${product.images[0].url}`}
                        alt={product.name}
                        className="w-20 h-20 object-cover border border-gray-300 rounded-md"
                      />
                    ) : (
                      <span className="text-gray-500 italic">Không có ảnh</span>
                    )}
                  </td>
                  <td className="px-1 py-1 text-center">
                    {Array.isArray(currentQuantities[product.id]) &&
                    currentQuantities[product.id].length > 0 ? (
                      [...new Set(currentQuantities[product.id].map((q) => q.expiry_date))].map(
                        (expiryDate, idx) => (
                          <div key={idx}>
                            {getTotalByExpiry(product.id, expiryDate)} (Hạn:{' '}
                            {formatDate(expiryDate)})
                          </div>
                        )
                      )
                    ) : (
                      <span>0</span>
                    )}
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      value={quantities[product.id]?.quantity || ''}
                      onChange={(e) =>
                        handleChangeQuantity(product.id, 'quantity', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="date"
                      value={quantities[product.id]?.expiry_date || ''}
                      onChange={(e) =>
                        handleChangeQuantity(product.id, 'expiry_date', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length > 0 && (
            <div className="text-center mt-4">
              <button
                type="submit"
                disabled={sending}
                className={`bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg shadow-md ${
                  sending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-900'
                }`}
              >
                {sending ? 'Đang lưu...' : '+ Thêm số lượng'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default QuantityAddStaff;