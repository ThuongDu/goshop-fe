import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:3000/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
        setError('Không thể tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...products];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.code && p.code.toString().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term)))
    }
    
    if (priceFilter) {
      switch (priceFilter) {
        case 'discount':
          result = result.filter(p => p.sale_price && p.sale_price > 0);
          break;
        case 'no_discount':
          result = result.filter(p => !p.sale_price || p.sale_price <= 0);
          break;
        default:
          break;
      }
    }
    
    if (expiryFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (expiryFilter) {
        case 'expired':
          result = result.filter(p => 
            p.expiry_date && new Date(p.expiry_date) < today
          );
          break;
        case 'nearExpiry':
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          result = result.filter(p => 
            p.expiry_date && 
            new Date(p.expiry_date) >= today && 
            new Date(p.expiry_date) <= nextWeek
          );
          break;
        case 'valid':
          result = result.filter(p => 
            !p.expiry_date || new Date(p.expiry_date) >= today
          );
          break;
        default:
          break;
      }
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, priceFilter, expiryFilter]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const formatWeight = (weight, unit) => {
    if (!weight) return '';

    if (unit && unit !== 'g') {
      return `${parseFloat(weight).toString()} ${unit}`;
    }

    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1).replace(/\.0$/, '')} kg`;
    }

    return `${parseFloat(weight).toString()} g`;
  };

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

  const resetFilters = () => {
    setSearchTerm('');
    setPriceFilter('');
    setExpiryFilter('');
  };

  if (loading) return <p className="p-4 text-gray-700">Đang tải danh sách sản phẩm...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="fw-full text-sm">
      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        <div className="mb-6 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm sản phẩm
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Nhập tên, mã hoặc mô tả sản phẩm..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="priceFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái giảm giá
            </label>
            <select
              id="priceFilter"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="discount">Đang giảm giá</option>
              <option value="no_discount">Không giảm giá</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="expiryFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Hạn sử dụng
            </label>
            <select
              id="expiryFilter"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="expired">Đã hết hạn</option>
              <option value="nearExpiry">Sắp hết hạn (7 ngày)</option>
              <option value="valid">Còn hạn</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Đặt lại
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-left text-gray-600">Không tìm thấy sản phẩm phù hợp.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-800 text-white text-left border-b border-gray-200">
                  <th className="px-2 py-1">ID</th>
                  <th className="px-2 py-1">Mã SP</th>
                  <th className="px-2 py-1">Tên</th>
                  <th className="px-2 py-1">Giá</th>
                  <th className="px-2 py-1">Trọng lượng</th>
                  <th className="px-2 py-1">Hạn SD</th>
                  <th className="px-2 py-1">Hình ảnh</th>
                  <th className="px-2 py-1">Người tạo</th>
                  <th className="px-2 py-1">Ngày tạo</th>
                  <th className="px-2 py-1">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, index) => {
                  const hasDiscount = p.sale_price && p.sale_price > 0;
                  const displayPrice = hasDiscount ? p.sale_price : p.price;
                  const isExpired = p.expiry_date && new Date(p.expiry_date) < new Date();
                  
                  return (
                    <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-2 py-1">{index + 1}</td>
                      <td className="px-2 py-1">{p.code}</td>
                      <td className="px-2 py-1">
                        <div className="font-medium">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-1">
                        <div className="flex flex-col">
                          <span className={hasDiscount ? "text-red-600 font-semibold" : ""}>
                            {formatCurrency(displayPrice)}
                          </span>
                          {hasDiscount && (
                            <span className="text-gray-500 line-through text-sm">
                              {formatCurrency(p.price)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1">
                        {formatWeight(p.weight, p.unit)}
                      </td>
                      <td className={`px-2 py-1 ${isExpired ? 'text-red-600 font-semibold' : ''}`}>
                        {formatDate(p.expiry_date)}
                        {isExpired && <span className="block text-xs">(Sắp hết hạn)</span>}
                      </td>
                      <td className="px-2 py-1">
                        {p.images && p.images.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {p.images.map((img) => ( 
                              <img
                                key={img.id}
                                src={`http://localhost:3000/${img.url}`} 
                                alt={p.name}
                                className="w-14 h-14 object-cover border rounded"
                                loading="lazy"
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-2 py-1">{p.nameCreated || "N/A"}</td>
                      <td className="px-2 py-1">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="px-2 py-1 space-x-1">
                        <button
                          onClick={() => navigate(`/AdminHome/Product/edit/${p.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-semibold px-1"
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:text-red-800 font-semibold px-1"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;