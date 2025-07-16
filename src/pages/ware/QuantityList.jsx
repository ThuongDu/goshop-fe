import React, { useEffect, useState } from 'react';
import axios from 'axios';

const QuantityList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
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
        console.error(err);
        setError('Lỗi khi tải danh sách kho');
      }
    };
    fetchWarehouses();
  }, [token]);

  // Lấy sản phẩm theo kho
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
          `http://localhost:3000/api/quantities/by-warehouse?warehouseId=${selectedWarehouse}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Lỗi khi tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedWarehouse, token]);

  // Xử lý xoá
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá không?')) {
      try {
        await axios.delete(`http://localhost:3000/api/quantities/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Xoá thành công');
        setData((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error(err);
        alert('Xoá thất bại');
      }
    }
  };

  return (
    <div className="w-full text-sm">
      <div className="bg-white max-h-20">
        <h1 className="text-2xl font-bold text-blue-800 py-5 px-5">Danh sách số lượng sản phẩm</h1>
      </div>

      <div className="mx-5 mt-5 p-6 bg-white rounded-lg shadow-md">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
              <th className="px-2 py-1">Chọn kho</th>
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
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500 text-center my-10">Chưa có dữ liệu.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-blue-800 text-white text-left">
                  <th className="px-2 py-1 w-[4%]">ID</th>
                  <th className="px-2 py-1 w-[12%]">Mã SP</th>
                  <th className="px-2 py-1 w-[14%]">Sản phẩm</th>
                  <th className="px-2 py-1 w-[10%]">Ảnh</th>
                  <th className="px-2 py-1 w-[10%]">Danh mục</th>
                  <th className="px-2 py-1 w-[16%]">Kho</th>
                  <th className="px-2 py-1 w-[8%] text-center">SL</th>
                  <th className="px-2 py-1 w-[15%] text-center">Ngày tạo</th>
                  <th className="px-2 py-1 w-[11%] text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-2 py-1">{idx + 1}</td>
                    <td className="px-2 py-1">{item.product_code}</td>
                    <td className="px-2 py-1">{item.product_name}</td>
                    <td className="px-2 py-1">
                      <img
                        src={`http://localhost:3000/${item.image_url}`}
                        alt=""
                        className="w-12 h-12 object-cover border rounded"
                      />
                    </td>
                    <td className="px-2 py-1">{item.category_name}</td>
                    <td className="px-2 py-1">{item.warehouse_name}</td>
                    <td className="px-2 py-1 text-center">{item.quantity}</td>
                    <td className="px-2 py-1 text-center">
                      {new Date(item.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 font-semibold px-1"
                      >
                        🗑️
                      </button>
                    </td>
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
