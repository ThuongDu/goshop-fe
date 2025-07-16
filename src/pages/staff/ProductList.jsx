import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductListStaff = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
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
  }, []);

  if (loading) return <p className="p-4 text-gray-700">Đang tải danh sách sản phẩm...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="w-full text-sm">
      <div className="bg-white max-h-20">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Danh sách sản phẩm của cửa hàng</h1>
      </div>

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {products.length === 0 ? (
          <p className="text-left text-gray-600">Chưa có sản phẩm nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
                  <th className="px-2 py-1 w-[5%]">Id</th>
                  <th className="px-2 py-1 w-[13%]">Mã SP</th>
                  <th className="px-2 py-1 w-[15%]">Tên</th>
                  <th className="px-2 py-1 w-[15%]">Giá</th>
                  <th className="px-2 py-1 w-[20%]">Hình ảnh</th>
                  <th className="px-2 py-1 w-[15%]">Ngày tạo</th> 
                </tr>
              </thead>
              <tbody>
                {products.map((p, index) => (
                  <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-2 py-1">{index + 1}</td>
                    <td className="px-2 py-1">{p.code}</td>
                    <td className="px-2 py-1">{p.name}</td>
                    <td className="px-2 py-1">{p.price?.toLocaleString()}₫</td>
                    <td className="px-2 py-1">
                      {p.images && p.images.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {p.images.map((img) => (
                            <img
                              key={img.id}
                              src={`http://localhost:3000/${img.url}`}
                              alt={p.name || ''}
                              className="w-14 h-14 object-cover border rounded"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">Không có ảnh</span>
                      )}
                    </td>
                    <td className="px-2 py-1">
                      {new Date(p.created_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListStaff;
