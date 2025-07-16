import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WarehouseList = () => {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);
    const [shops, setShops] = useState([]);
    const [newWarehouse, setNewWarehouse] = useState({ name: '', shop_id: '' });

    const token = localStorage.getItem('token');
useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    const fetchData = async () => {
      try {
        const [whRes, shopRes] = await Promise.all([
          axios.get('http://localhost:3000/api/warehouses', 
            { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/api/shops', 
            { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setWarehouses(whRes.data);
        setShops(shopRes.data);
      } catch (err) {
        console.error('Lỗi tải kho:', err);
      }
    };

    fetchData();
  }, [navigate, token]);

  const handleCreate = async () => {
    if (warehouses.find(w => w.shop_id === newWarehouse.shop_id)) {
        alert('Mỗi cửa hàng chỉ được có 1 kho!');
        return;
    }

    try {
        await axios.post('http://localhost:3000/api/warehouses', newWarehouse, {
        headers: { Authorization: `Bearer ${token}` },
        });
        alert('Tạo kho thành công!');
        window.location.reload();
    } catch (err) {
        alert('Lỗi: ' + (err.response?.data?.message || 'Không thể tạo kho'));
    }
    };

    const handleDelete = async (warehouseId) => {
      const confirmDelete = window.confirm('Bạn có chắc muốn xóa kho này không?');
      if (!confirmDelete) return;

      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/warehouses/${warehouseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWarehouses((prev) => prev.filter((warehouse) => warehouse.id !== warehouseId));
      } catch (err) {
        console.error('Lỗi khi xoá sản phẩm:', err);
        alert('Xoá sản phẩm thất bại');
      }
    };

  return (
    <div>
      <div className="max-h-20 bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Danh sách kho</h1>    
      </div>
      <div className="my-5 mx-5 bg-white px-6 py-4 text-sm rounded-lg shadow-md">
        <table className="table-fixed">
          <thead>
            <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
              <th className="px-2 py-1 w-[600px]">Tên kho</th>
              <th className="px-2 py-1 w-[550px]">Cửa hàng</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-2">
                <input
                  type="text"
                  placeholder="Tên kho"
                  value={newWarehouse.name}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                  className="border border-gray-300 rounded-md p-2 w-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                </td>
              <td className="px-2 py-2">
                <select
                  value={newWarehouse.shop_id}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, shop_id: e.target.value })}
                  className="border border-gray-300 rounded-md p-2 w-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn cửa hàng</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td className="px-2 py-2 flex justify-end" colSpan="2">
                <button
                  onClick={handleCreate}
                  className="bg-blue-600  text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                  Thêm kho
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="px-6 text-sm mx-5 my-5 p-6 bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
              <th className="px-2 py-1 w-[5px]">ID</th>
                <th className="px-2 py-1 w-[50px]">Tên kho</th>
                <th className="px-2 py-1 w-[100px]">Cửa hàng</th>
                <th className="px-2 py-1 w-[50px]">Ngày tạo</th>
                <th className="px-2 py-1 w-[30px]">Thao tác</th>
              </tr>
            </thead>
          <tbody>
          {warehouses.map((w, index) => (
            <tr key={w.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-2 py-1">{index + 1}</td>
              <td className="px-2 py-1">{w.name}</td>
              <td className="px-2 py-1">{w.shop_name}</td>
              <td className="px-2 py-1">
                {new Date(w.created_at).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric'
                })}
              </td>
              <td className="px-2 py-1">
                <button
                  onClick={() => navigate(`/AdminHome/Warehouse/edit/${w.id}`)}
                  className="text-blue-600 font-semibold px-1"
                  title="Sửa"
                >
                  ✏️
                </button>
                <button
                  onClick={() => {handleDelete(w.id)}}
                  className="text-red-600 font-semibold px-1"
                  title="Xóa"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarehouseList;
