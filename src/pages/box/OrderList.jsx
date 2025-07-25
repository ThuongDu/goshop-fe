import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOrders();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [filterStatus, searchKeyword, startDate, endDate, token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = buildFilterUrl();
      const res = await axios.get(`http://localhost:3000/api/orders?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      setError("Không thể tải danh sách đơn hàng: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const buildFilterUrl = () => {
    const params = new URLSearchParams();
    if (filterStatus) params.append("status", filterStatus);
    if (searchKeyword) params.append("search", searchKeyword.trim());
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    return params.toString();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Cập nhật trạng thái thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p className="text-center mt-8">Đang tải...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="w-full text-sm">
      <div className="mx-5 mt-4 mb-2 flex flex-wrap items-center gap-2">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="">-- Lọc theo trạng thái --</option>
          <option value="đang xử lý">Đang xử lý</option>
          <option value="chờ lấy hàng">Chờ lấy hàng</option>
          <option value="thành công">Thành công</option>
        </select>

        <input
          type="text"
          placeholder="Tìm mã đơn, khách hàng, người tạo..."
          value={searchKeyword || ""}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="border px-3 py-2 rounded-md relative z-10"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-3 py-2 rounded-md"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-3 py-2 rounded-md"
        />

        <button
          onClick={() => {
            setFilterStatus("");
            setSearchKeyword("");
            setStartDate("");
            setEndDate("");
          }}
          className="px-3 py-1 bg-gray-200 rounded text-sm"
        >
          Xóa lọc
        </button>
      </div>

      <div className="mx-5 mb-5 p-6 bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-blue-800 text-white text-left">
              <th className="px-3 py-2">Mã đơn</th>
              <th className="px-3 py-2">Khách hàng</th>
              <th className="px-3 py-2">Cửa hàng</th>
              <th className="px-3 py-2 text-right">Tổng tiền</th>
              <th className="px-3 py-2 text-right">Thuế</th>
              <th className="px-3 py-2">Phương thức thanh toán</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Người tạo</th>
              <th className="px-3 py-2">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  <Link
                    to={`/AdminHome/Orders/detail/${order.id}`}
                    className="text-blue-600 underline"
                  >
                    {order.code}
                  </Link>
                </td>
                <td className="px-3 py-2">{order.customer_name || "—"}</td>
                <td className="px-3 py-2">{order.shop_name || "—"}</td>
                <td className="px-3 py-2 text-right">
                  {Number(order.total_price).toLocaleString()}₫
                </td>
                <td className="px-3 py-2 text-right">
                  {Number(order.tax).toLocaleString()}₫
                </td>
                <td className="px-3 py-2">
                  {order.payment_method || "Chưa xác định"}
                </td>
                <td className="px-3 py-2">
                  {order.status === "thành công" ? (
                    <span className="capitalize">{order.status}</span>
                  ) : (
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="border px-2 py-1 rounded text-sm"
                    >
                      <option value={order.status}>{order.status}</option>
                      {order.status === "đang xử lý" && (
                        <option value="chờ lấy hàng">Chờ lấy hàng</option>
                      )}
                      {order.status === "chờ lấy hàng" && (
                        <option value="thành công">Thành công</option>
                      )}
                    </select>
                  )}
                </td>
                <td className="px-3 py-2">{order.created_by_name || "—"}</td>
                <td className="px-3 py-2">
                  {new Date(order.created_at).toLocaleDateString("vi-VN", {
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