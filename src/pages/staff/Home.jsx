import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const HomeStaff = () => {
  const [openMenu, setOpenMenu] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "staff") {
      alert("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
  }, [navigate]);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? '' : menu);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/');
  };

  return (
    <div className="flex h-screen">
      <div className="w-72 bg-white text-blue-800 p-4 space-y-4 font-bold">
        <h2 className="text-2xl mb-4">GoShop Staff 👨‍💼</h2>
        <nav className="space-y-2">
          <Link to="Revenue/Overview" className="block p-2 rounded hover:bg-blue-400 hover:text-white">📊 Tổng quan</Link>

          <div>
            <button onClick={() => toggleMenu('product')} className="w-full text-left p-2 rounded hover:bg-blue-400 hover:text-white">🛍 Sản phẩm</button>
            {openMenu === 'product' && (
              <div className="ml-4 space-y-1 text-sm font-normal">
                <Link to="Product/list" className="block p-2 rounded hover:bg-blue-200">Danh sách sản phẩm</Link>
              </div>
            )}
          </div>

          <div>
            <button onClick={() => toggleMenu('orders')} className="w-full text-left p-2 rounded hover:bg-blue-400 hover:text-white">🧾 Đơn hàng</button>
            {openMenu === 'orders' && (
              <div className="ml-4 space-y-1 text-sm font-normal">
                <Link to="Orders/list" className="block p-2 rounded hover:bg-blue-200">Danh sách đơn hàng</Link>
                <Link to="Orders/add" className="block p-2 rounded hover:bg-blue-200">Tạo đơn hàng</Link>
              </div>
            )}
          </div>

          <div>
            <button onClick={() => toggleMenu('warehouse')} className="w-full text-left p-2 rounded hover:bg-blue-400 hover:text-white">📦 Kho</button>
            {openMenu === 'warehouse' && (
              <div className="ml-4 space-y-1 text-sm font-normal">
                <Link to="Quantity/add" className="block p-2 rounded hover:bg-blue-200">Nhập kho</Link>
                <Link to="Quantity/list" className="block p-2 rounded hover:bg-blue-200">Sản phẩm tồn kho</Link>
              </div>
            )}
          </div>
          <div>
            <button onClick={() => toggleMenu('warehouse')} className="w-full text-left p-2 rounded hover:bg-blue-400 hover:text-white">Customer</button>
            {openMenu === 'warehouse' && (
              <div className="ml-4 space-y-1 text-sm font-normal">
                <Link to="Customer/list" className="block p-2 rounded hover:bg-blue-200">Danh sách khách hàng</Link>
                <Link to="Customer/add" className="block p-2 rounded hover:bg-blue-200">Thêm khách hàng</Link>
              </div>
            )}
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="w-full text-left p-2 rounded hover:bg-red-300 hover:text-white"
            >
              Đăng xuất
            </button>
          </div>
        </nav>
      </div>
      <div className="bg-gray-100 w-full overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default HomeStaff;
