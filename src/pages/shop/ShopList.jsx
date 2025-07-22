import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ShopList = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách shop
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/shops', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShops(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách cửa hàng:', err);
        setError('Không thể tải danh sách cửa hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const getRegion = (region) => {
    switch (region) {
      case 'bac': return 'Miền Bắc';
      case 'trung': return 'Miền Trung';
      case 'nam': return 'Miền Nam';
      default: return 'Không xác định';
    }
  };

  const getStatus = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      default: return 'Không xác định';
    }
  };

  const handleDelete = async (shopId) => {
    if (!window.confirm('Bạn có chắc muốn xóa cửa hàng này không?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/shops/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShops((prev) => prev.filter((shop) => shop.id !== shopId));
    } catch (err) {
      console.error('Lỗi khi xoá cửa hàng:', err);
      alert('Xoá cửa hàng thất bại');
    }
  };

  if (loading) return <p className="p-4 text-gray-700">Đang tải danh sách cửa hàng...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="w-full text-sm">
      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {shops.length === 0 ? (
          <div className="flex flex-col items-center">
            <p className="text-gray-600 mb-4">Chưa có cửa hàng nào.</p>
            <Link 
              to="/AdminHome/Shop/add" 
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
            >
              + Thêm cửa hàng
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex justify-end mb-4">
              <Link 
                to="/AdminHome/Shop/add" 
                className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
              >
                + Thêm cửa hàng
              </Link>
            </div>
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
                  <th className="px-2 py-1 w-[5%]">Id</th>
                  <th className="px-2 py-1 w-[20%]">Tên</th>
                  <th className="px-2 py-1 w-[30%]">Địa chỉ</th>
                  <th className="px-2 py-1 w-[15%]">Khu vực</th>
                  <th className="px-2 py-1 w-[15%]">SĐT</th>
                  <th className="px-2 py-1 w-[15%]">Ngày tạo</th>
                  <th className="px-2 py-1 w-[15%]">Trạng thái</th>
                  <th className="px-2 py-1 w-[10%]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop, index) => (
                  <tr key={shop.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-2 py-1">{index + 1}</td>
                    <td className="px-2 py-1">{shop.name}</td>
                    <td className="px-2 py-1">
                      {shop.address_detail}, {shop.ward}, {shop.district}, {shop.province}
                    </td>
                    <td className="px-2 py-1">{getRegion(shop.region)}</td>
                    <td className="px-2 py-1">{shop.phone || '-'}</td>
                    <td className="px-2 py-1">
                      {new Date(shop.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </td>
                    <td className="px-2 py-1">{getStatus(shop.status)}</td>
                    <td className="px-2 py-1">
                      <button
                        onClick={() => navigate(`/AdminHome/Shop/edit/${shop.id}`)}
                        className="text-blue-600 font-semibold px-1"
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(shop.id)}
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
        )}
      </div>
    </div>
  );
};

export default ShopList;