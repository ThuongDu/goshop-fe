import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StaffList = () => {
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDeleteStaff = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn chưa đăng nhập!');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa người dùng này không?')) return;

    try {
      await axios.delete(`http://localhost:3000/api/auth/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      console.error('Lỗi xóa:', err);
      alert('Xóa thất bại!');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user'));

    if (!token || !userData || userData.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [userResponse, shopResponse] = await Promise.all([
          axios.get('http://localhost:3000/api/auth/all', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:3000/api/shops', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUsers(userResponse.data);
        setShops(shopResponse.data);
      } catch (err) {
        console.error(err);
        setError('Đã xảy ra lỗi khi lấy dữ liệu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <p className="text-center mt-10 text-gray-500">Đang tải danh sách người dùng...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="fw-full text-sm">
      <div className="max-h-20 bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Danh sách nhân viên</h1>
      </div>
      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {users.length === 0 ? (
          <p className="text-center text-gray-600">Chưa có người dùng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
                  <th className="px-2 py-1 w-[5px]">Id</th>
                  <th className="px-2 py-1">Tên</th>
                  <th className="px-2 py-1">Điện thoại</th>
                  <th className="px-2 py-1">Cửa hàng</th>
                  <th className="px-2 py-1">Vai trò</th>
                  <th className="px-2 py-1">Trạng thái</th>
                  <th className='px-2 py-1'>Ngày tạo</th> 
                  <th className="px-2 py-1">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-2 py-1">{index + 1}</td>
                    <td className="px-2 py-1">{user.name}</td>
                    <td className="px-2 py-1">{user.phone}</td>
                    <td className="px-2 py-1">
                      {user.shop_id ? (shops.find(shop => shop.id === user.shop_id)?.name || '') : ''}
                    </td>
                    <td className="px-2 py-1">{user.role}</td>
                    <td className="px-2 py-1">Hoạt động</td>
                    <td className="px-2 py-1">
                      {new Date(user.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </td>
                    <td className="px-2 py-1">
                      <button
                        onClick={() => alert(`Sửa user ID: ${user.id}`)}
                        className="text-blue-600 font-semibold px-1"
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(user.id)}
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

export default StaffList;
