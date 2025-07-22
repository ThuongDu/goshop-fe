import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const OrderDetail = () => {
  const { orderId }   = useParams();
  const navigate      = useNavigate();
  const token         = localStorage.getItem("token");

  const [info, setInfo]     = useState(null);  
  const [items, setItems]   = useState([]);   
  const [loading, setLoad]  = useState(true);
  const [error, setErr]     = useState("");

  useEffect(() => {
    (async () => {
      setLoad(true);
      try {
        const { data: i } = await axios.get(
          `http://localhost:3000/api/orders/${orderId}`,
          { headers:{ Authorization:`Bearer ${token}` } }
        );
        setInfo(i);

        const { data: d } = await axios.get(
          `http://localhost:3000/api/orders/${orderId}/details`,
          { headers:{ Authorization:`Bearer ${token}` } }
        );
        setItems(d);
      } catch (err) {
        console.error("Lỗi tải chi tiết:", err);
        setErr("Không thể tải chi tiết đơn hàng");
      } finally { setLoad(false); }
    })();
  }, [orderId, token]);

  if (loading) return <p className="text-center mt-8">Đang tải...</p>;
  if (error)   return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="w-full text-sm">

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        <div className="mb-4 space-y-1">
          <p><span className="font-semibold">Mã đơn:</span> {info.code}</p>
          <p><span className="font-semibold">Trạng thái:</span> {info.status}</p>
          <p><span className="font-semibold">Ngày tạo:</span>{" "}
            {new Date(info.created_at).toLocaleDateString("vi-VN")}
          </p>
          <p><span className="font-semibold">Khách hàng:</span> {info.customer_name || "—"}</p>
          <p><span className="font-semibold">Cửa hàng:</span> {info.shop_name || "—"}</p>
        </div>

        <table className="min-w-full border-collapse">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="px-3 py-2 text-left">Tên SP</th>
              <th className="px-3 py-2 text-left">Mã SP</th>
              <th className="px-3 py-2 text-center">SL</th>
              <th className="px-3 py-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it=>(
              <tr key={it.product_id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{it.product_name}</td>
                <td className="px-3 py-2">{it.product_code}</td>
                <td className="px-3 py-2 text-center">{it.quantity}</td>
                <td className="px-3 py-2 text-right">{Number(it.total_price).toLocaleString()}₫</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-6">
          <div className="w-full sm:w-1/2 md:w-1/3 bg-gray-50 border border-gray-300 rounded p-4 shadow-sm">
            <div className="flex justify-between text-sm mb-1">
              <span>Tạm tính</span><span>{(info.total_price - info.tax).toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Thuế (VAT 8%)</span><span>{Number(info.tax).toLocaleString()}₫</span>
            </div>
            <hr className="my-2"/>
            <div className="flex justify-between text-lg font-semibold text-blue-700">
              <span>Tổng cộng</span><span>{Number(info.total_price).toLocaleString()}₫</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded shadow"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
