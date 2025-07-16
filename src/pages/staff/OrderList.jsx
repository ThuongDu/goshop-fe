import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const OrderListStaff = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const token = localStorage.getItem("token");

  /* ─── Lấy danh sách ─── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const url = `http://localhost:3000/api/staff/orders${
          filterStatus ? `?status=${encodeURIComponent(filterStatus)}` : ""
        }`;
        const { data } = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data);
      } catch (err) {
        console.error("Lỗi tải đơn:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, filterStatus]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/orders/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      alert(err.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  if (loading) return <p className="text-center mt-8">Đang tải...</p>;

  return (
    <div className="fw-full text-sm">
      <div className="bg-white px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-800">Đơn hàng của tôi</h1>
      </div>

      {/* Bộ lọc */}
      <div className="mx-5 mt-4 mb-2 flex items-center">
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
        <button
          onClick={() => setFilterStatus("")}
          className="ml-2 px-3 py-1 bg-gray-200 rounded text-sm"
        >
          Xóa lọc
        </button>
      </div>

      {/* Bảng */}
      <div className="mx-5 mb-5 p-6 bg-white rounded-lg shadow-md">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-blue-800 text-white text-left">
              <th className="px-3 py-2">Mã đơn</th>
              <th className="px-3 py-2">Khách hàng</th>
              <th className="px-3 py-2 text-right">Tổng tiền</th>
              <th className="px-3 py-2 text-right">Thuế</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 font-semibold">
                  <Link
                    to={`/Home/Orders/detail/${o.id}`}
                    className="text-blue-700 underline"
                  >
                    {o.code}
                  </Link>
                </td>
                <td className="px-3 py-2">{o.customer_name || "—"}</td>
                <td className="px-3 py-2 text-right">
                  {Number(o.total_price).toLocaleString()}₫
                </td>
                <td className="px-3 py-2 text-right">
                  {Number(o.tax).toLocaleString()}₫
                </td>

                {/* Dropdown trạng thái */}
                <td className="px-3 py-2 capitalize">
                  {o.status === "thành công" ? (
                    o.status
                  ) : (
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="border px-2 py-1 rounded text-sm"
                    >
                      <option value={o.status}>{o.status}</option>
                      {o.status === "đang xử lý" && (
                        <option value="chờ lấy hàng">Chờ lấy hàng</option>
                      )}
                      {o.status === "chờ lấy hàng" && (
                        <option value="thành công">Thành công</option>
                      )}
                    </select>
                  )}
                </td>

                <td className="px-3 py-2">
                  {new Date(o.created_at).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="text-center mt-4 text-gray-500">Chưa có đơn hàng nào</p>
        )}
      </div>
    </div>
  );
};

export default OrderListStaff;
