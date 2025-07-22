import React, { useEffect, useState } from 'react';
import axios from 'axios';


const QuantityList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoadingWarehouses(true);
      try {
        const res = await axios.get('http://localhost:3000/api/warehouses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWarehouses(res.data);
      } catch (err) {
        console.error(err);
        setError('❌ Lỗi khi tải danh sách kho');
      } finally {
        setLoadingWarehouses(false);
      }
    };
    fetchWarehouses();
  }, [token]);

  useEffect(() => {
    if (!selectedWarehouse) {
      setData([]);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(
          `http://localhost:3000/api/quantities/group-by-product?warehouseId=${selectedWarehouse}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('❌ Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedWarehouse, token]);

  return (
    <div className="w-full text-sm">
      {/* Chọn kho */}
      <div className="mx-5 mt-5 p-4 bg-white rounded shadow">
        <label className="block mb-2 font-semibold">Chọn kho:</label>
        {loadingWarehouses ? (
          <p>Đang tải danh sách kho...</p>
        ) : (
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">-- Chọn kho --</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Bảng */}
      <div className="mx-5 my-5 p-4 bg-white rounded shadow">
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500 text-center">Chưa có dữ liệu.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-800 text-white text-left">
                <tr>
                  <th className="px-2 py-1">ID</th>
                  <th className="px-2 py-1">Mã SP</th>
                  <th className="px-2 py-1">Tên SP</th>
                  <th className="px-2 py-1">Ảnh</th>
                  <th className="px-2 py-1">Danh mục</th>
                  <th className="px-2 py-1">Kho</th>
                  <th className="px-2 py-1">Tổng SL</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.product_id} className="border-b">
                    <td className="px-2 py-1">{idx + 1}</td>
                    <td className="px-2 py-1">{item.product_code}</td>
                    <td className="px-2 py-1">{item.product_name}</td>
                    <td className="px-2 py-1">
                      {item.image_url ? (
                        <img
                          src={`http://localhost:3000/${item.image_url}`}
                          alt={item.product_name}
                          className="w-20 h-20 object-cover border rounded"
                        />
                      ) : '-'}
                    </td>
                    <td className="px-2 py-1">{item.category_names}</td>
                    <td className="px-2 py-1">{item.warehouse_name}</td>
                    <td className="px-2 py-1 text-center">{item.total_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default QuantityList;
