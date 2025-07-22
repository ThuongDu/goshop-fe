import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductListStaff = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/staff/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
        setError('Không thể tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) return <p className="p-4 text-gray-700">Đang tải danh sách sản phẩm...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="w-full text-sm p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {filteredProducts.length === 0 ? (
          <p className="text-left text-gray-600">Không có sản phẩm nào.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
                    <th className="px-2 py-1 w-[5%]">STT</th>
                    <th className="px-2 py-1 w-[13%]">Mã SP</th>
                    <th className="px-2 py-1 w-[15%]">Tên</th>
                    <th className="px-2 py-1 w-[10%]">Giá</th>
                    <th className="px-2 py-1 w-[10%]">Giá Ưu Đãi</th>
                    <th className="px-2 py-1 w-[10%]">Trọng Lượng</th>
                    <th className="px-2 py-1 w-[10%]">Đơn Vị</th>
                    <th className="px-2 py-1 w-[15%]">Hình ảnh</th>
                    <th className="px-2 py-1 w-[15%]">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((p, index) => (
                    <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-2 py-1">{indexOfFirstProduct + index + 1}</td>
                      <td className="px-2 py-1">{p.code || 'N/A'}</td>
                      <td className="px-2 py-1">{p.name || 'Chưa có tên'}</td>
                      <td className="px-2 py-1">{p.price?.toLocaleString() || '0'}₫</td>
                      <td className="px-2 py-1">
                        {p.sale_price && p.sale_price > 0 ? `${p.sale_price.toLocaleString()}₫` : '-'}
                      </td>
                      <td className="px-2 py-1">{p.weight ? `${p.weight} ${p.unit || ''}` : '-'}</td>
                      <td className="px-2 py-1">{p.unit || '-'}</td>
                      <td className="px-2 py-1">
                        {p.image_url ? (
                          <img
                            src={`http://localhost:3000/${p.image_url}`}
                            alt={p.name || 'Hình ảnh sản phẩm'}
                            className="w-14 h-14 object-cover border rounded"
                          />
                        ) : (
                          <span className="text-gray-500">Không có ảnh</span>
                        )}
                      </td>
                      <td className="px-2 py-1">
                        {new Date(p.created_at).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Phân trang */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 rounded-l-md disabled:opacity-50"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-300 rounded-r-md disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductListStaff;