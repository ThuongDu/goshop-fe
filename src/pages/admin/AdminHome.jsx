import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiShoppingBag, FiUsers, FiTruck, FiPackage,
  FiUser, FiLogOut, FiHome,
  FiChevronDown, FiChevronRight,
  FiShoppingCart, FiGrid, FiList,
} from 'react-icons/fi';
import { HiOutlineChartBar } from 'react-icons/hi';

const AdminHome = () => {
  const [openMenus, setOpenMenus] = useState({});
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
  }, []);

  const isParentActive = (basePath) => {
    return location.pathname.includes(`/AdminHome/${basePath}`);
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
    
      <div className="w-64 bg-white text-gray-800 p-4 shadow-lg border-r border-gray-200 flex flex-col">
        <div className="flex items-center p-4 mb-4 border-b border-gray-100">
          <FiShoppingBag className="text-2xl text-blue-600 mr-2" />
          <h1 className="text-xl font-bold text-gray-800">GoShop Admin</h1>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
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
                  Thêm đơn hàng
                </NavLink>
              </div>
            )}
          </div>

          <div className={`rounded-lg ${isParentActive('Quantity') ? 'bg-blue-50' : ''}`}>
            <button
              onClick={() => toggleMenu('quantities')}
              className={`
                flex items-center justify-between w-full p-3 rounded-lg transition-colors
                ${isParentActive('Quantity') ? 'text-blue-700 font-medium' : 'hover:bg-gray-100'}
              `}
            >
              <div className="flex items-center">
                <FiList className="mr-3 text-lg" />
                <span>Tồn kho</span>
              </div>
              {openMenus.quantities || isParentActive('Quantity') ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>

            {(openMenus.quantities || isParentActive('Quantity')) && (
              <div className="ml-8 mt-1 space-y-1">
                <NavLink
                  to="Quantity/list"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Danh sách sản phẩm
                </NavLink>
                <NavLink
                  to="Quantity/add"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Nhập kho
                </NavLink>
              </div>
            )}
          </div>

          <div className={`rounded-lg ${isParentActive('StockOut') ? 'bg-blue-50' : ''}`}>
            <button
              onClick={() => toggleMenu('stockout')}
              className={`
                flex items-center justify-between w-full p-3 rounded-lg transition-colors
                ${isParentActive('StockOut') ? 'text-blue-700 font-medium' : 'hover:bg-gray-100'}
              `}
            >
              <div className="flex items-center">
                <FiList className="mr-3 text-lg" />
                <span>Xuất kho</span>
              </div>
              {openMenus.stockout || isParentActive('StockOut') ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>

            {(openMenus.stockout || isParentActive('StockOut')) && (
              <div className="ml-8 mt-1 space-y-1">
                <NavLink
                  to="StockOut/list"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Danh sách sản phẩm
                </NavLink>
                <NavLink
                  to="StockOut/add"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Xuất kho
                </NavLink>
              </div>
            )}
          </div>

          <div className={`rounded-lg ${isParentActive('Product') ? 'bg-blue-50' : ''}`}>
            <button
              onClick={() => toggleMenu('products')}
              className={`
                flex items-center justify-between w-full p-3 rounded-lg transition-colors
                ${isParentActive('Product') ? 'text-blue-700 font-medium' : 'hover:bg-gray-100'}
              `}
            >
              <div className="flex items-center">
                <FiPackage className="mr-3 text-lg" />
                <span>Sản phẩm</span>
              </div>
              {openMenus.products || isParentActive('Product') ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>

            {(openMenus.products || isParentActive('Product')) && (
              <div className="ml-8 mt-1 space-y-1">
                <NavLink
                  to="Product/list"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Danh sách sản phẩm
                </NavLink>
                <NavLink
                  to="Product/add"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Thêm sản phẩm
                </NavLink>
              </div>
            )}
          </div>

          <div className={`rounded-lg ${isParentActive('Warehouse') ? 'bg-blue-50' : ''}`}>
            <button
              onClick={() => toggleMenu('warehouse')}
              className={`
                flex items-center justify-between w-full p-3 rounded-lg transition-colors
                ${isParentActive('Warehouse') ? 'text-blue-700 font-medium' : 'hover:bg-gray-100'}
              `}
            >
              <div className="flex items-center">
                <FiTruck className="mr-3 text-lg" />
                <span>Kho hàng</span>
              </div>
              {openMenus.warehouse || isParentActive('Warehouse') ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>

            {(openMenus.warehouse || isParentActive('Warehouse')) && (
              <div className="ml-8 mt-1 space-y-1">
                <NavLink
                  to="Warehouse/list"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Danh sách kho
                </NavLink>
                <NavLink
                  to="Warehouse/Product"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Sản phẩm trong kho
                </NavLink>
              </div>
            )}
          </div>


          <div className={`rounded-lg ${isParentActive('Shop') ? 'bg-blue-50' : ''}`}>
            <button
              onClick={() => toggleMenu('shop')}
              className={`
                flex items-center justify-between w-full p-3 rounded-lg transition-colors
                ${isParentActive('Shop') ? 'text-blue-700 font-medium' : 'hover:bg-gray-100'}
              `}
            >
              <div className="flex items-center">
                <FiHome className="mr-3 text-lg" />
                <span>Cửa hàng</span>
              </div>
              {openMenus.shop || isParentActive('Shop') ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>

            {(openMenus.shop || isParentActive('Shop')) && (
              <div className="ml-8 mt-1 space-y-1">
                <NavLink
                  to="Shop/list"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Danh sách cửa hàng
                </NavLink>
              </div>
            )}
          </div>

          <div className={`rounded-lg ${isParentActive('Category') ? 'bg-blue-50' : ''}`}>
            <button
              onClick={() => toggleMenu('categories')}
              className={`
                flex items-center justify-between w-full p-3 rounded-lg transition-colors
                ${isParentActive('Category') ? 'text-blue-700 font-medium' : 'hover:bg-gray-100'}
              `}
            >
              <div className="flex items-center">
                <FiGrid className="mr-3 text-lg" />
                <span>Danh mục</span>
              </div>
              {openMenus.categories || isParentActive('Category') ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>

            {(openMenus.categories || isParentActive('Category')) && (
              <div className="ml-8 mt-1 space-y-1">
                <NavLink
                  to="Category/list"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Danh sách danh mục
                </NavLink>
                <NavLink
                  to="Category/add"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Thêm danh mục
                </NavLink>
              </div>
            )}
          </div>

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

          <div className={`rounded-lg ${isParentActive('Staff') ? 'bg-blue-50' : ''}`}>
            <button
              onClick={() => toggleMenu('staff')}
              className={`
                flex items-center justify-between w-full p-3 rounded-lg transition-colors
                ${isParentActive('Staff') ? 'text-blue-700 font-medium' : 'hover:bg-gray-100'}
              `}
            >
              <div className="flex items-center">
                <FiUsers className="mr-3 text-lg" />
                <span>Nhân viên</span>
              </div>
              {openMenus.staff || isParentActive('Staff') ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>

            {(openMenus.staff || isParentActive('Staff')) && (
              <div className="ml-8 mt-1 space-y-1">
                <NavLink
                  to="Staff/list"
                  className={({ isActive }) => `
                    block p-2 rounded text-sm transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  Danh sách nhân viên
                </NavLink>
              </div>
            )}
          </div>

          
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors mt-auto mb-4"
        >
          <FiLogOut className="mr-3 text-lg" />
          <span>Đăng xuất</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-end items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FiUser className="text-blue-600" />
              </div>
              <span className="ml-2 text-sm font-medium">
                {user ? user.name : 'Admin'}
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

export default AdminHome;