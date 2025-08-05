import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiSearch } from 'react-icons/fi';
import { FaEdit, FaTrash } from 'react-icons/fa';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter] = useState('all');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/customers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(res.data);
        setFilteredCustomers(res.data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách khách hàng');
      }
    };
    fetchCustomers();
  }, [token]);

  useEffect(() => {
    let result = customers;

    if (searchTerm) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    setFilteredCustomers(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, customers]);

  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const confirmDelete = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = customers.filter((c) => c.id !== id);
      setCustomers(updated);
      setFilteredCustomers(updated);
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      alert('Xoá thất bại');
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc SĐT"
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-3">{error}</p>}
        {currentCustomers.length === 0 ? (
          <p className="text-gray-600 text-center">Không tìm thấy khách hàng phù hợp.</p>
        ) : (
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
                <th className="px-2 py-1 w-[5%]">ID</th>
                <th className="px-2 py-1 w-[25%]">Tên khách hàng</th>
                <th className="px-2 py-1 w-[20%]">Số điện thoại</th>
                <th className="px-2 py-1 w-[20%]">Ngày tạo</th>
                <th className="px-2 py-1 w-[15%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((c, index) => (
                <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-2 py-1">{indexOfFirst + index + 1}</td>
                  <td className="px-2 py-1">{c.name}</td>
                  <td className="px-2 py-1">{c.phone}</td>
                  <td className="px-2 py-1">{new Date(c.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className="px-2 py-1">
                    <button
                      onClick={() => alert(`Sửa khách hàng ID: ${c.id}`)}
                      className="text-blue-600 font-semibold px-1"
                      title="Sửa"
                    >
                      <FaEdit className="inline" />
                    </button>
                    <button
                      onClick={() => confirmDelete(c)}
                      className="text-red-600 font-semibold px-2"
                      title="Xóa"
                    >
                      <FaTrash className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

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

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 border-t border-b border-gray-300 ${
                    currentPage === i + 1
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

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

        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc muốn xóa khách hàng <span className="font-semibold">{customerToDelete?.name}</span>?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(customerToDelete.id)}
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

export default CustomerList;
