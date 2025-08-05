import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiShoppingBag, FiTruck, FiChevronDown, FiChevronRight,
  FiUser, FiLogOut, FiShoppingCart
} from 'react-icons/fi';
import { HiOutlineChartBar } from 'react-icons/hi';

const HomeStaff = () => {
  const [openMenus, setOpenMenus] = useState({});
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== "staff") {
      alert("Bạn không có quyền truy cập trang này!");
      navigate("/");
    } else {
      setUser(userData);
    }
  }, [navigate]);

  const isParentActive = (basePath) => {
    return location.pathname.includes(`/HomeStaff/${basePath}`);
  };

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white text-gray-800 p-4 shadow-lg border-r border-gray-200 flex flex-col">
        <div className="flex items-center p-4 mb-4 border-b border-gray-100">
          <FiShoppingBag className="text-2xl text-blue-600 mr-2" />
          <h1 className="text-xl font-bold text-gray-800">GoShop Staff</h1>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          <NavLink
            to="Revenue/Overview"
            className={({ isActive }) => `
              flex items-center p-3 rounded-lg transition-all
              ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}
            `}
          >
            <HiOutlineChartBar className="mr-3 text-lg" />
            <span>Tổng quan</span>
          </NavLink>

          {/* Orders */}
          <div className={`rounded-lg ${isParentActive('Orders') ? 'bg-blue-50' : ''}`}>
            <button
              onClick={() => toggleMenu('orders')}
              className={`
                flex items-center justify-between w-full p-3 rounded-lg transition-colors
                ${isParentActive('Orders') ? 'text-blue-700 font-medium' : 'hover:bg-gray-100'}
              `}
            >
              <div className="flex items-center">
                <FiShoppingCart className="mr-3 text-lg" />
                <span>Đơn hàng</span>
              </div>
              {openMenus.orders || isParentActive('Orders') ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>

            {(openMenus.orders || isParentActive('Orders')) && (
              <div className="ml-8 mt-1 space-y-1">
                <NavLink
                  to="Orders/list"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Danh sách đơn hàng
                </NavLink>
                <NavLink
                  to="Orders/add"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Tạo đơn hàng
                </NavLink>
              </div>
            )}
          </div>

          {/* Warehouse */}
          <div className={`rounded-lg ${isParentActive('Quantity') ? 'bg-blue-50' : ''}`}>
            <button
              onClick={() => toggleMenu('warehouse')}
              className={`
                flex items-center justify-between w-full p-3 rounded-lg transition-colors
                ${isParentActive('Quantity') ? 'text-blue-700 font-medium' : 'hover:bg-gray-100'}
              `}
            >
              <div className="flex items-center">
                <FiTruck className="mr-3 text-lg" />
                <span>Kho hàng</span>
              </div>
              {openMenus.warehouse || isParentActive('Quantity') ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>

            {(openMenus.warehouse || isParentActive('Quantity')) && (
              <div className="ml-8 mt-1 space-y-1">
                <NavLink
                  to="Quantity/add"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Nhập kho
                </NavLink>
                <NavLink
                  to="Quantity/list"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Sản phẩm tồn kho
                </NavLink>
              </div>
            )}
          </div>

          {/* Customers */}
          <div className={`rounded-lg ${isParentActive('Customer') ? 'bg-blue-50' : ''}`}>
            <button
              onClick={() => toggleMenu('customers')}
              className={`
                flex items-center justify-between w-full p-3 rounded-lg transition-colors
                ${isParentActive('Customer') ? 'text-blue-700 font-medium' : 'hover:bg-gray-100'}
              `}
            >
              <div className="flex items-center">
                <FiUser className="mr-3 text-lg" />
                <span>Khách hàng</span>
              </div>
              {openMenus.customers || isParentActive('Customer') ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>

            {(openMenus.customers || isParentActive('Customer')) && (
              <div className="ml-8 mt-1 space-y-1">
                <NavLink
                  to="Customer/list"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Danh sách khách hàng
                </NavLink>
                <NavLink
                  to="Customer/add"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Thêm khách hàng
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors mt-auto mb-4"
        >
          <FiLogOut className="mr-3 text-lg" />
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-end items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FiUser className="text-blue-600" />
              </div>
              <span className="ml-2 text-sm font-medium">
                {user ? user.name : 'Staff'}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HomeStaff;