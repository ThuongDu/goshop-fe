import React, { useEffect, useState } from "react";
import axios from "axios";

const ShopStockList = ({ shopId }) => {
  const token = localStorage.getItem("token");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterWh] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const url = `http://localhost:3000/api/quantities/staff/quantities${shopId ? `?shopId=${shopId}` : ""}`;
        const { data } = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // optional filter kho trước khi gộp
        const filtered = filterWh ? data.filter(d => d.warehouse_id === +filterWh) : data;

        // gộp theo product_code, giữ category_name đầu tiên
        const grouped = Object.values(
          filtered.reduce((acc, cur) => {
            const key = cur.product_code;
            if (!acc[key]) {
              acc[key] = {
                product_code : cur.product_code,
                product_name : cur.product_name,
                category_name: cur.category_name,
                image_url    : cur.image_url,
                quantity     : 0,
                updated_at   : cur.updated_at,
              };
            }
            acc[key].quantity += cur.quantity;
            if (new Date(cur.updated_at) > new Date(acc[key].updated_at)) {
              acc[key].updated_at = cur.updated_at;
            }
            return acc;
          }, {})
        );
        setRows(grouped);
      } catch (err) {
        console.error(err);
        setError("Không thể tải tồn kho");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, shopId, filterWh]);

  if (loading) return <p className="text-center mt-8">Đang tải...</p>;
  if (error)   return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="w-full text-sm">
      <div className="mx-5 mb-5 p-6 bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Danh mục</th>
              <th className="px-3 py-2 text-left">Mã SP</th>
              <th className="px-3 py-2 text-left">Tên SP</th>
              <th className="px-3 py-2 text-left">Ảnh</th>
              <th className="px-3 py-2 text-center">Tổng tồn</th>
              <th className="px-3 py-2 text-left">Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.product_code} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{r.category_name}</td>
                <td className="px-3 py-2">{r.product_code}</td>
                <td className="px-3 py-2">{r.product_name}</td>
                <td className="px-3 py-2">
                  {r.image_url ? (
                    <img src={`http://localhost:3000/${r.image_url}`} alt="img" className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">{r.quantity}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(r.updated_at).toLocaleDateString("vi-VN")} {" "}
                  {new Date(r.updated_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <p className="text-center mt-4 text-gray-500">Không có dữ liệu</p>
        )}
      </div>
    </div>
  );
};

export default ShopStockList;
