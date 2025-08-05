import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StaffDashboard = () => {
  const [soldCount, setSoldCount] = useState(0);
  const [shopRevenue, setShopRevenue] = useState(0);
  const [staffRevenueList, setStaffRevenueList] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [orderStatusCounts, setOrderStatusCounts] = useState([]);
  const [dateRange, setDateRange] = useState('today');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // eslint-disable-next-line no-unused-vars
  const formatCurrency = (num) => (num || num === 0 ? Number(num).toLocaleString('vi-VN') + '₫' : '—');
  const formatDate = (date) => new Date(date).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

  useEffect(() => {
    if (!token) {
      setError('Vui lòng đăng nhập để xem tổng quan');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = { dateRange };
        const headers = { Authorization: `Bearer ${token}` };

        const endpoints = [
          '/api/statistics/staff/sold-products',
          '/api/statistics/staff/shop-revenue',
          '/api/statistics/revenue-by-staff',
          '/api/statistics/staff/top-products',
          '/api/statistics/staff/recent-orders',
          '/api/statistics',
          '/api/statistics/order-status-counts',
        ];

        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            axios.get(`http://localhost:3000${endpoint}`, { headers, params }).catch((err) => {
              console.error(`Error fetching ${endpoint}:`, err.response?.status, err.response?.data);
              throw err;
            })
          )
        );

        setSoldCount(responses[0].data.soldProducts || 0);
        setShopRevenue(responses[1].data.revenue || 0);
        setStaffRevenueList(Array.isArray(responses[2].data) ? responses[2].data : []);
        setTopProducts(Array.isArray(responses[3].data) ? responses[3].data : []);
        setRecentOrders(Array.isArray(responses[4].data) ? responses[4].data : []);
        setTotalOrders(responses[5].data.total_orders || 0);
        setTotalCustomers(responses[5].data.total_customers || 0);
        setOrderStatusCounts(Array.isArray(responses[6].data) ? responses[6].data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu tổng quan');
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, dateRange]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tổng Quan Nhân Viên</h2>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-800 disabled:opacity-50"
            disabled={isLoading}
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
          </select>
        </div>

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Số sản phẩm đã bán */}
          <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow">
            <span className="text-2xl">🛍️</span>
            <div>
              <p className="text-gray-500">Sản phẩm đã bán</p>
              <p className="text-xl font-semibold text-gray-800">{soldCount}</p>
            </div>
          </div>

          {/* Doanh thu cửa hàng */}
          <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-gray-500">Tổng doanh thu cửa hàng</p>
              <p className="text-xl font-semibold text-gray-800">{formatCurrency(shopRevenue)}</p>
            </div>
          </div>

          {/* Doanh thu cá nhân */}
          <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow">
            <span className="text-2xl">👥</span>
            <div>
              <p className="text-gray-500">Doanh thu của bạn</p>
              <p className="text-xl font-semibold text-gray-800">
                {formatCurrency(staffRevenueList.find((s) => s.isCurrentUser)?.revenue || 0)}
              </p>
            </div>
          </div>

          {/* Tổng số đơn hàng */}
          <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow">
            <span className="text-2xl">📦</span>
            <div>
              <p className="text-gray-500">Tổng số đơn hàng</p>
              <p className="text-xl font-semibold text-gray-800">{totalOrders}</p>
            </div>
          </div>

          {/* Tổng số khách hàng */}
          <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-gray-500">Tổng số khách hàng</p>
              <p className="text-xl font-semibold text-gray-800">{totalCustomers}</p>
            </div>
          </div>

          {/* Trạng thái đơn hàng */}
          <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-gray-500">Trạng thái đơn hàng</p>
              <ul className="text-sm text-gray-800">
                {orderStatusCounts.map((status) => (
                  <li key={status.status}>
                    {status.status}: <span className="font-semibold">{status.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top sản phẩm bán chạy */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">📈</span>
              <h3 className="text-lg font-semibold text-gray-800">Sản phẩm bán chạy</h3>
            </div>
            {topProducts.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {topProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className="flex justify-between items-center p-3 border-b border-gray-200 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{product.product_name}</p>
                      <p className="text-sm text-gray-500">Số lượng: {product.total_quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800">{formatCurrency(product.total_revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Chưa có dữ liệu sản phẩm</p>
            )}
          </div>

          {/* Đơn hàng gần đây */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">🕒</span>
              <h3 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h3>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-3 border-b border-gray-200 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{order.code}</p>
                      <p className="text-sm text-gray-500">{order.customer_name || 'Khách vãng lai'}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <p className="font-semibold text-gray-800">{formatCurrency(order.total_price)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Chưa có đơn hàng nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;