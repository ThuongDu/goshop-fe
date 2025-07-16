import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditWarehouse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [name, setName] = useState('');
  const [shopId, setShopId] = useState('');
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    const fetchData = async () => {
      try {
        const [warehouseRes, shopRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/warehouses/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:3000/api/shops', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setName(warehouseRes.data.name);
        setShopId(warehouseRes.data.shop_id);
        setShops(shopRes.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu kho:', err);
        setError('Không thể tải dữ liệu kho');
      }
      setLoading(false);
    };
    fetchData();
  }, [id, navigate, token]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) {
      setError('Vui lòng nhập tên kho');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await axios.put(`http://localhost:3000/api/warehouses/${id}`, 
        { name, shop_id: shopId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Cập nhật kho thành công!');
      setTimeout(() => navigate('/AdminHome/Warehouse/list'), 1200);
    } catch (err) {
      console.error('Lỗi lưu:', err);
      setError('Không thể lưu kho');
    }
    setSaving(false);
  };

  if (loading) return <p className="p-4">Đang tải dữ liệu...</p>;

  return (
    <div className="fw-full text-sm">
      <div className="max-h-20 bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Sửa kho</h1>
      </div>

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <form onSubmit={handleSave}>
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-blue-800 text-white text-left">
                <th className="px-2 py-1">Tên kho</th>
                <th className="px-2 py-1">Cửa hàng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-1 py-1">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tên kho"
                    className="w-full px-2 py-2 border rounded-md"
                  />
                </td>
                <td className="px-1 py-1">
                  <select
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    className="w-full px-2 py-2 border rounded-md"
                    disabled={loading}
                  >
                    <option value="">Chọn cửa hàng</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-center mt-3">
            <button
              type="submit"
              disabled={saving}
              className={`bg-blue-800 text-white py-2 px-6 rounded-lg ${saving ? 'opacity-50' : ''}`}
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWarehouse;
