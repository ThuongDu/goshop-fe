import React, { useEffect, useState } from "react";
import axios from "axios";

const ITEMS_PER_PAGE = 10;

const QuantityList = ({ shopId }) => {
  const token = localStorage.getItem("token");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Không có";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:3000/api/quantities/staff/quantities${
        shopId ? `?shopId=${shopId}` : ""
      }`;

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Gộp theo product_code và warehouse_name
      const grouped = data.reduce((acc, item) => {
        const key = `${item.product_code}-${item.warehouse_name}`;
        if (!acc[key]) {
          acc[key] = {
            product_code: item.product_code,
            product_name: item.product_name,
            category_name: item.category_name,
            warehouse_name: item.warehouse_name,
            image_url: item.image_url,
            total_quantity: 0,
            expiry_details: [],
          };
        }
        acc[key].total_quantity += item.quantity;
        acc[key].expiry_details.push({
          quantity: item.quantity,
          expiry_date: item.expiry_date,
          created_by_name: item.created_by_name,
        });
        return acc;
      }, {});

      const result = Object.values(grouped).filter((item) =>
        item.total_quantity > 0
      );

      setRows(result);
    } catch (err) {
      console.error(err);
      setError("Không thể tải tồn kho");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, shopId]);

  // Search filter
  const filteredRows = rows.filter(
    (item) =>
      item.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset to page 1 on new search
  };

  if (loading) return <p className="text-center mt-8">Đang tải...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="w-full text-sm">
      <div className="mx-5 mb-5 p-6 bg-white rounded-lg shadow-md overflow-x-auto">
        <div className="mb-4 flex items-center justify-between">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hoặc tên sản phẩm..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border border-gray-300 rounded px-3 py-2 w-80 text-sm"
          />
        </div>

        {/* Table */}
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="px-3 py-2 text-left">STT</th>
              <th className="px-3 py-2 text-left">Danh mục</th>
              <th className="px-3 py-2 text-left">Mã SP</th>
              <th className="px-3 py-2 text-left">Tên SP</th>
              <th className="px-3 py-2 text-left">Ảnh</th>
              <th className="px-3 py-2 text-center">Tổng tồn</th>
              <th className="px-3 py-2 text-left">Cập nhật</th>
              <th className="px-3 py-2 text-left">Người tạo</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((item, idx) => (
              <tr
                key={`${item.product_code}-${item.warehouse_name}`}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-3 py-2">
                  {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                </td>
                <td className="px-3 py-2">{item.category_name}</td>
                <td className="px-3 py-2">{item.product_code}</td>
                <td className="px-3 py-2">{item.product_name}</td>
                <td className="px-3 py-2">
                  {item.image_url ? (
                    <img
                      src={`http://localhost:3000/${item.image_url}`}
                      className="w-12 h-12 object-cover rounded"
                      alt="product"
                    />
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {Math.round(item.total_quantity)}
                </td>
                <td className="px-3 py-2">
                  {item.expiry_details.length === 1 ? (
                    `${item.expiry_details[0].quantity} (HSD: ${formatDate(
                      item.expiry_details[0].expiry_date
                    )})`
                  ) : (
                    <ul className="list-disc pl-4">
                      {item.expiry_details.map((d, i) => (
                        <li key={i}>
                          {d.quantity} (HSD: {formatDate(d.expiry_date)})
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-3 py-2">
                  {item.expiry_details.length === 1 ? (
                    item.expiry_details[0].created_by_name
                  ) : (
                    <ul className="list-disc pl-4">
                      {item.expiry_details.map((d, i) => (
                        <li key={i}>{d.created_by_name}</li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* No data */}
        {filteredRows.length === 0 && (
          <p className="text-center mt-4 text-gray-500">Không có dữ liệu</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1 rounded ${
                  currentPage === num
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuantityList;
