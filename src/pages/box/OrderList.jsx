import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `http://localhost:3000/api/orders${filterStatus ? `?status=${encodeURIComponent(filterStatus)}` : ''}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(data);
      } catch (err) {
        setError("Không thể tải danh sách đơn hàng");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Cập nhật local state
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  if (loading) return <p className="text-center mt-8">Đang tải...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="fw-full text-sm">
      {/* Header */}
      <div className="bg-white px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-800">Danh sách đơn hàng</h1>
      </div>

      {/* Filter */}
      <div className="mx-5 mt-4 mb-2 flex items-center">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="">-- Lọc theo trạng thái --</option>
          <option value="đang xử lý">Đang xử lý</option>
          <option value="chờ lấy hàng">Chờ lấy hàng</option>
          <option value="thành công">Thành công</option>
        </select>
        <button 
          onClick={() => setFilterStatus("")} 
          className="ml-2 px-3 py-1 bg-gray-200 rounded text-sm"
        >
          Xóa lọc
        </button>
      </div>

      {/* Table */}
      <div className="mx-5 mb-5 p-6 bg-white rounded-lg shadow-md">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-blue-800 text-white text-left">
              <th className="px-3 py-2">Mã đơn</th>
              <th className="px-3 py-2">Khách hàng</th>
              <th className="px-3 py-2">Cửa hàng</th>
              <th className="px-3 py-2 text-right">Tổng tiền</th>
              <th className="px-3 py-2 text-right">Thuế</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  <Link
                    to={`/AdminHome/Orders/detail/${o.id}`}
                    className="text-blue-600 underline"
                  >
                    {o.code}
                  </Link>
                </td>
                <td className="px-3 py-2">{o.customer_name || "—"}</td>
                <td className="px-3 py-2">{o.shop_name}</td>
                <td className="px-3 py-2 text-right">
                  {Number(o.total_price).toLocaleString()}₫
                </td>
                <td className="px-3 py-2 text-right">
                  {Number(o.tax).toLocaleString()}₫
                </td>
                <td className="px-3 py-2">
                  {o.status === 'thành công' ? (
                    <span className="capitalize">{o.status}</span>
                  ) : (
                    <select
                      value={o.status}
                      onChange={e => handleStatusChange(o.id, e.target.value)}
                      className="border px-2 py-1 rounded text-sm"
                    >
                      <option value={o.status}>{o.status}</option>
                      {o.status === 'đang xử lý' && (
                        <option value="chờ lấy hàng">Chờ lấy hàng</option>
                      )}
                      {o.status === 'chờ lấy hàng' && (
                        <option value="thành công">Thành công</option>
                      )}
                    </select>
                  )}
                </td>
                <td className="px-3 py-2">
                  {new Date(o.created_at).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="text-center mt-4 text-gray-500">Không có đơn hàng nào</p>
        )}
      </div>
    </div>
  );
};

export default OrderList;
