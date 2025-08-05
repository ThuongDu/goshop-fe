import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { FaUserShield, FaUserTie } from 'react-icons/fa';

const StaffList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const handleDeleteStaff = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn chưa đăng nhập!');
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/auth/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(user => user.id !== id));
      setFilteredUsers(prev => prev.filter(user => user.id !== id));
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Lỗi xóa:', err);
      alert('Xóa thất bại!');
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
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
        const userResponse = await axios.get('http://localhost:3000/api/auth/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('User Response:', userResponse.data); // Debug
        setUsers(userResponse.data || []);
        setFilteredUsers(userResponse.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Đã xảy ra lỗi khi lấy dữ liệu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    let result = users;
    if (searchTerm) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatus = (status) => {
    switch (status) {
      case 'active': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Hoạt động</span>;
      case 'inactive': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Không hoạt động</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Không xác định</span>;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <FaUserShield className="text-blue-600 mr-1" />;
      case 'staff': return <FaUserTie className="text-green-600 mr-1" />;
      default: return <FaUserTie className="text-gray-600 mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) return <div className="p-4 text-red-600 text-center">{error}</div>;

  return (
    <div className="container mx-auto">
      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc SĐT"
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="staff">Nhân viên</option>
          </select>

          <select
            className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {currentUsers.length === 0 ? (
          <div className="text-gray-500 text-center my-10">
            Không tìm thấy nhân viên nào phù hợp
          </div>
        ) : (
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
                <th className="px-2 py-1 w-[5%]">ID</th>
                <th className="px-2 py-1 w-[15%]">Tên nhân viên</th>
                <th className="px-2 py-1 w-[15%]">Điện thoại</th>
                <th className="px-2 py-1 w-[20%]">Cửa hàng</th>
                <th className="px-2 py-1 w-[10%]">Vai trò</th>
                <th className="px-2 py-1 w-[10%]">Ngày tạo</th>
                <th className="px-2 py-1 w-[10%]">Trạng thái</th>
                <th className="px-2 py-1 w-[10%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-2 py-1">{indexOfFirstUser + index + 1}</td>
                  <td className="px-2 py-1">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-2 py-1 text-sm text-gray-500">{user.phone || '-'}</td>
                  <td className="px-2 py-1 text-sm text-gray-500">{user.shop_name || '-'}</td>
                  <td className="px-2 py-1">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-2 py-1">{getStatus(user.status)}</td>
                  <td className="px-2 py-1 text-sm font-medium">
                    <button
                      onClick={() => navigate(`/AdminHome/Staff/edit/${user.id}`)}
                      className="text-blue-600 font-semibold px-1"
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => confirmDelete(user)}
                      className="text-red-600 font-semibold px-2"
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                &laquo;
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 border-t border-b border-gray-300 ${currentPage === pageNum ? 'bg-blue-50 text-blue-600 font-medium' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                &raquo;
              </button>
            </nav>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc muốn xóa nhân viên <span className="font-semibold">{userToDelete?.name}</span>?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDeleteStaff(userToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffList;