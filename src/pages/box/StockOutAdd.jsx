import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StockOutAdd = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({}); // { product_id: { quantity, reason } }
  const [currentQuantities, setCurrentQuantities] = useState({}); // { product_id: total_quantity }
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  // Lấy danh sách kho
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/warehouses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWarehouses(res.data);
      } catch (err) {
        console.error('Lỗi lấy kho:', err);
        setError('Không thể tải danh sách kho');
      }
    };
    fetchWarehouses();
  }, [token]);

  // Lấy danh mục theo kho
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

  // Lấy sản phẩm và số lượng tồn hiện tại
  useEffect(() => {
    if (selectedCategory && selectedWarehouse) {
      const fetchProductsAndQuantities = async () => {
        try {
          const res = await axios.get(
            `http://localhost:3000/api/productcategories/category/${selectedCategory}?warehouseId=${selectedWarehouse}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setProducts(res.data);

          const productIds = res.data.map(p => p.id).join(',');
          if (productIds) {
            const qtyRes = await axios.get(
              `http://localhost:3000/api/quantities/current?warehouseId=${selectedWarehouse}&productIds=${productIds}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const totalQuantities = {};
            Object.keys(qtyRes.data).forEach(productId => {
              const total = qtyRes.data[productId].reduce((sum, q) => sum + q.quantity, 0);
              totalQuantities[productId] = total;
            });
            setCurrentQuantities(totalQuantities);
          } else {
            setCurrentQuantities({});
          }
        } catch (err) {
          console.error('Lỗi fetchProductsAndQuantities:', err);
          setError(err.response?.data?.message || 'Không thể tải sản phẩm hoặc số lượng tồn kho');
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
    setQuantities(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const itemsToRemove = products
      .filter(p => quantities[p.id]?.quantity && parseInt(quantities[p.id].quantity) > 0)
      .map(p => ({
        product_id: p.id,
        quantity: parseInt(quantities[p.id].quantity),
        warehouse_id: selectedWarehouse,
        reason: quantities[p.id].reason || '',
      }));

    if (!selectedWarehouse || !selectedCategory || itemsToRemove.length === 0) {
      setError('Vui lòng chọn kho, danh mục, và nhập số lượng hợp lệ');
      setLoading(false);
      return;
    }

    for (const item of itemsToRemove) {
      const current = currentQuantities[item.product_id] || 0;
      if (item.quantity > current) {
        setError(`Số lượng xuất cho sản phẩm ${item.product_id} vượt quá tồn kho`);
        setLoading(false);
        return;
      }
    }

    try {
      await Promise.all(
        itemsToRemove.map(item =>
          axios.post('http://localhost:3000/api/stockout', item, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setSuccess('Xuất kho thành công!');
      setQuantities({});
      setTimeout(() => setSuccess(''), 3000);

      const res = await axios.get(
        `http://localhost:3000/api/productcategories/category/${selectedCategory}?warehouseId=${selectedWarehouse}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(res.data);

      const productIds = res.data.map(p => p.id).join(',');
      if (productIds) {
        const qtyRes = await axios.get(
          `http://localhost:3000/api/quantities/current?warehouseId=${selectedWarehouse}&productIds=${productIds}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const totalQuantities = {};
        Object.keys(qtyRes.data).forEach(productId => {
          const total = qtyRes.data[productId].reduce((sum, q) => sum + q.quantity, 0);
          totalQuantities[productId] = total;
        });
        setCurrentQuantities(totalQuantities);
      }
    } catch (err) {
      console.error('Lỗi xuất kho:', err);
      setError(err.response?.data?.message || 'Xuất kho thất bại');
    } finally {
      setLoading(false);
    }
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
                    onChange={e => setSelectedWarehouse(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Chọn kho --</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-1 py-1">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
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
                <th className="px-2 py-2 w-[20%]">Ảnh</th>
                <th className="px-2 py-2 w-[15%]">Tồn kho hiện tại</th>
                <th className="px-2 py-2 w-[15%]">Xuất kho</th>
                <th className="px-2 py-2 w-[25%]">Lý do</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-t border-gray-300">
                  <td className="px-1 py-1">{product.name}</td>
                  <td className="px-1 py-1">
                    {product.images?.length > 0 ? (
                      <img
                        src={`http://localhost:3000/${product.images[0].url}`}
                        alt=""
                        className="w-20 h-20 object-cover border border-gray-300 rounded-md"
                      />
                    ) : (
                      <span className="text-gray-500 italic">Không có ảnh</span>
                    )}
                  </td>
                  <td className="px-1 py-1 text-center">
                    {currentQuantities[product.id] || 0}
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      value={quantities[product.id]?.quantity || ''}
                      onChange={e => handleChangeQuantity(product.id, 'quantity', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="0"
                      min="0"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="text"
                      value={quantities[product.id]?.reason || ''}
                      onChange={e => handleChangeQuantity(product.id, 'reason', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="Lý do xuất kho"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-center mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-6 rounded-lg shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Đang xử lý...' : 'Xuất kho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockOutAdd;