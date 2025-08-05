import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

const ShopList = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/shops", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("shops data:", res.data); // Debug
        setShops(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách cửa hàng:", err);
        setError("Không thể tải danh sách cửa hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const getRegion = (region) => {
    switch (region) {
      case "bac":
        return "Miền Bắc";
      case "trung":
        return "Miền Trung";
      case "nam":
        return "Miền Nam";
      default:
        return "Không xác định";
    }
  };

  const getStatus = (status) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Không hoạt động";
      default:
        return "Không xác định";
    }
  };

  const handleDelete = async (shopId) => {
    if (!window.confirm("Bạn có chắc muốn xóa cửa hàng này không?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/shops/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShops((prev) => prev.filter((shop) => shop.id !== shopId));
    } catch (err) {
      console.error("Lỗi khi xoá cửa hàng:", err);
      alert("Xoá cửa hàng thất bại");
    }
  };

  const filteredShops = shops.filter((shop) => {
    const term = searchTerm.toLowerCase();
    return (
      shop.name?.toLowerCase().includes(term) ||
      shop.phone?.toLowerCase().includes(term) ||
      shop.region?.toLowerCase().includes(term) ||
      `${shop.address_detail} ${shop.ward} ${shop.district} ${shop.province}`
        .toLowerCase()
        .includes(term)
    );
  });

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);
  const currentShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  if (loading)
    return <p className="p-4 text-gray-700">Đang tải danh sách cửa hàng...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="w-full text-sm">
      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, địa chỉ, SĐT..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-md"
          />
          <Link
            to="/AdminHome/Shop/add"
            className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
          >
            + Thêm cửa hàng
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
                <th className="px-2 py-1 w-[5%]">ID</th>
                <th className="px-2 py-1 w-[20%]">Tên</th>
                <th className="px-2 py-1 w-[30%]">Địa chỉ</th>
                <th className="px-2 py-1 w-[15%]">Khu vực</th>
                <th className="px-2 py-1 w-[15%]">SĐT</th>
                <th className="px-2 py-1 w-[15%]">Ngày tạo</th>
                <th className="px-2 py-1 w-[15%]">Trạng thái</th>
                <th className="px-2 py-1 w-[10%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(currentShops) && currentShops.length > 0 ? (
                currentShops.map((shop, index) => (
                  <tr
                    key={shop.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-2 py-1">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-2 py-1">{shop.name}</td>
                    <td className="px-2 py-1">
                      {shop.address_detail}, {shop.ward}, {shop.district},{" "}
                      {shop.province}
                    </td>
                    <td className="px-2 py-1">{getRegion(shop.region)}</td>
                    <td className="px-2 py-1">{shop.phone || "-"}</td>
                    <td className="px-2 py-1">
                      {new Date(shop.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-2 py-1">{getStatus(shop.status)}</td>
                    <td className="px-2 py-1">
                      <button
                        onClick={() => navigate(`/AdminHome/Shop/edit/${shop.id}`)}
                        className="text-blue-600 font-semibold px-1"
                        title="Sửa"
                      >
                        <FaEdit className="inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(shop.id)}
                        className="text-red-600 font-semibold px-1"
                        title="Xóa"
                      >
                        <FaTrash className="inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-gray-600 py-4">
                    Không tìm thấy cửa hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-800 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopList;