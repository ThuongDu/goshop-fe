import React, { useEffect, useState } from 'react';
import axios from 'axios';

const QuantityAdd = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [currentQuantities, setCurrentQuantities] = useState({});  // mới thêm
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');

  // Lấy kho
  useEffect(() => {
    const fetchWarehouses = async () => {
      const res = await axios.get('http://localhost:3000/api/warehouses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWarehouses(res.data);
    };
    fetchWarehouses();
  }, [token]);

  // Lấy danh mục theo kho
  useEffect(() => {
    if (selectedWarehouse) {
      const fetchCategories = async () => {
        const res = await axios.get(`http://localhost:3000/api/categories/warehouse/${selectedWarehouse}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
      };
      fetchCategories();
    } else {
      setCategories([]);
      setSelectedCategory('');
    }
  }, [selectedWarehouse, token]);

  // Lấy sản phẩm + số lượng tồn hiện tại
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
            setCurrentQuantities(qtyRes.data);  // { product_id: total_quantity }
          } else {
            setCurrentQuantities({});
          }
        } catch (err) {
          console.error('Lỗi fetchProductsAndQuantities:', err);
        }
      };
      fetchProductsAndQuantities();
    } else {
      setProducts([]);
      setQuantities({});
      setCurrentQuantities({});
    }
  }, [selectedCategory, selectedWarehouse, token]);

  const handleChangeQuantity = (productId, value) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const itemsToAdd = products
      .filter((p) => quantities[p.id] && parseInt(quantities[p.id]) > 0)
      .map((p) => ({
        product_id: p.id,
        image_id: p.images?.[0]?.id || null,
        category_id: selectedCategory,
        warehouse_id: selectedWarehouse,
        quantity: parseInt(quantities[p.id]),
      }));

    if (!selectedWarehouse || !selectedCategory || itemsToAdd.length === 0) {
      setError('Vui lòng chọn kho, danh mục và nhập số lượng sản phẩm hợp lệ');
      return;
    }

    try {
      await Promise.all(
        itemsToAdd.map((item) =>
          axios.post('http://localhost:3000/api/quantities', item, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setSuccess('Thêm số lượng thành công!');
      setQuantities({});
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Thêm số lượng thất bại');
    }
  };

  return (
    <div className="w-full text-sm">
      <div className="max-h-20 bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Nhập kho</h1>
      </div>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Chọn kho --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-1 py-1">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
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
                <th className="px-2 py-2 w-[30%]">Tên sản phẩm</th>
                <th className="px-2 py-2 w-[20%]">Ảnh</th>
                <th className="px-2 py-2 w-[20%]">Tồn kho hiện tại</th>
                <th className="px-2 py-2 w-[30%]">Nhập thêm</th>
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
                        alt=""
                        className="w-20 h-20 object-cover border border-gray-300 rounded-md"
                      />
                    ) : (
                      <span className="text-gray-500 italic">Không có ảnh</span>
                    )}
                  </td>
                  <td className="px-1 py-1 text-center">
                    {currentQuantities[product.id] ?? 0}
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      value={quantities[product.id] || ''}
                      onChange={(e) => handleChangeQuantity(product.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="0"
                      min="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-center mt-4">
            <button
              type="submit"
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
            >
              + Thêm số lượng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuantityAdd;
