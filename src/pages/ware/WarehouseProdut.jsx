import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AddProductsToWarehouse = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, warehousesRes] = await Promise.all([
          axios.get('http://localhost:3000/api/products', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/api/warehouses', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProducts(productsRes.data);
        setWarehouses(warehousesRes.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!selectedWarehouse) {
      setCategories([]);
      return;
    }
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/categories/warehouse/${selectedWarehouse}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCategories(res.data);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    };
    fetchCategories();
  }, [selectedWarehouse, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWarehouse || selectedProducts.length === 0 || selectedCategories.length === 0) {
      setMessage('❗ Vui lòng chọn kho, ít nhất 1 sản phẩm và 1 danh mục');
      return;
    }
    setLoading(true); setMessage('');
    try {
      await axios.post('http://localhost:3000/api/quantities/add-many', {
        warehouse_id: selectedWarehouse,
        product_ids: selectedProducts,
        category_ids: selectedCategories
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Thêm sản phẩm vào kho thành công!');
      setSelectedProducts([]); setSelectedCategories([]);
    } catch (err) {
      console.error('Lỗi thêm sản phẩm:', err);
      setMessage('❌ Thêm sản phẩm thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full text-sm">

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {message && (
          <p className={`mb-4 ${message.startsWith('✅') ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="font-bold bg-blue-800 text-white px-3 py-2 rounded-t">Chọn kho</p>
            <div className="border border-gray-300 rounded-b">
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full px-4 py-2 border-none focus:ring-0 rounded-b"
              >
                <option value="">-- Chọn kho --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-1/2">
              <p className="font-bold bg-blue-800 text-white px-3 py-2 rounded-t">Danh sách sản phẩm</p>
              <div className="border border-gray-300 rounded-b max-h-[300px] overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-gray-500 px-3 py-2">Không có sản phẩm</p>
                ) : (
                  products.map((p) => (
                    <label key={p.id} className="flex items-center px-3 py-1 hover:bg-blue-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(p.id)}
                        onChange={() =>
                          setSelectedProducts(
                            selectedProducts.includes(p.id)
                              ? selectedProducts.filter((id) => id !== p.id)
                              : [...selectedProducts, p.id]
                          )
                        }
                        className="mr-2"
                      />
                      {p.name}
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Danh mục */}
            <div className="w-1/2">
              <p className="font-bold bg-blue-800 text-white px-3 py-2 rounded-t">Danh mục theo kho</p>
              <div className="border border-gray-300 rounded-b max-h-[300px] overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-gray-500 px-3 py-2">Không có danh mục</p>
                ) : (
                  categories.map((c) => (
                    <label key={c.id} className="flex items-center px-3 py-1 hover:bg-blue-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(c.id)}
                        onChange={() =>
                          setSelectedCategories(
                            selectedCategories.includes(c.id)
                              ? selectedCategories.filter((id) => id !== c.id)
                              : [...selectedCategories, c.id]
                          )
                        }
                        className="mr-2"
                      />
                      {c.name}
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 bg-blue-800 text-white px-5 py-2 rounded hover:bg-blue-900 transition disabled:opacity-50"
          >
            {loading ? 'Đang thêm...' : '+ Thêm vào kho'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductsToWarehouse;
