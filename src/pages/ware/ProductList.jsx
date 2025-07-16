import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:3000/api/products', {
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
    fetchData();
  }, []);

  if (loading) return <p className="p-4 text-gray-700">Đang tải danh sách sản phẩm...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm('Bạn có chắc muốn xóa sản phẩm này không?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (err) {
      console.error('Lỗi khi xoá sản phẩm:', err);
      alert('Xoá sản phẩm thất bại');
    }
  };

  return (
    <div className="fw-full text-sm">
      <div className="max-h-20 bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Danh sách sản phẩm</h1>
      </div>

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {products.length === 0 ? (
          <p className="text-left text-gray-600">Chưa có sản phẩm nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
                  <th className="px-2 py-1 w-[5%]">ID</th>
                  <th className="px-2 py-1 w-[13%]">Mã sản phẩm</th>
                  <th className="px-2 py-1 w-[15%]">Tên</th>
                  <th className="px-2 py-1 w-[15%]">Giá</th>
                  <th className="px-2 py-1 w-[15%]">Hình ảnh</th>
                  <th className="px-2 py-1 w-[12%]">Ngày tạo</th>
                  <th className="px-2 py-1 w-[12%]">Người tạo</th>
                  <th className='px-2 py-1 w-[15%]'>Ngày tạo</th>
                  <th className="px-2 py-1 w-[15%]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, index) => (
                  <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-2 py-1">{index + 1}</td>
                    <td className="px-2 py-1">{p.code}</td>
                    <td className="px-2 py-1">{p.name}</td>
                    <td className="px-2 py-1">{p.price}₫</td>
                    <td className="px-2 py-1">
                      {p.images && p.images.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {p.images.map((img) => (
                            <img
                              key={img.id}
                              src={`http://localhost:3000/${img.url}`} 
                              alt={img.name || ''}
                              className="w-14 h-14 object-cover border rounded"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500"> </span>
                      )}
                    </td>
                    <td className="px-2 py-1">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-2 py-1">{p.nameCreated || " "}</td>
                    <td className="px-2 py-1">
                      {new Date(p.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </td>
                    <td className="px-2 py-1">
                      <button
                        onClick={() => navigate(`/AdminHome/Product/edit/${p.id}`)}
                        className="text-blue-600 font-semibold px-1"
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => { handleDelete(p.id); }}
                        className="text-red-600 font-semibold px-1"
                        title="Xóa"
                      >
                        🗑️
                      </button>
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

export default ProductList;
