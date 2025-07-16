import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthPage from "./pages/login/AuthPage";
import AdminHome from "./pages/admin/AdminHome";
import Forgot from "./pages/login/ForgotPassword";
import StaffHome from "./pages/staff/Home";
import PrivateRoute from "./components/PrivateRoutes";
import { checkAuth } from "./utils/authCheck";

import ShopList from "./pages/shop/ShopList";
import ShopAdd from "./pages/shop/ShopAdd";
import StaffList from "./pages/admin/StaffList";
import AdminOverview from "./pages/admin/AdminOverview"
import WarehouseList from "./pages/ware/WarehouseList";
import CategoryList from "./pages/ware/CategoryList";
import CategoryAdd from "./pages/ware/CategoryAdd";
import ProductList from "./pages/ware/ProductList";
import ProductAdd from "./pages/ware/ProductAdd";
import QuantityAdd from "./pages/ware/QuantityAdd";
import QuantityList from "./pages/ware/QuantityList";
import CustomerAdd from "./pages/box/CustomerAdd"; 
import CustomerList from "./pages/box/CustomerList"; 
import OrderList from "./pages/box/OrderList";
import OrderAdd from "./pages/box/OrderAdd";
import OrderDetail from "./pages/box/OrderDetail";
import WarehouseProduct from "./pages/ware/WarehouseProdut";
import EditShop from "./pages/edit/Shop";
import EditWarehouse from "./pages/edit/Warehouse";
import EditCategory from "./pages/edit/Category";
import EditProduct from "./pages/edit/Product";

import QuantityListStaff from "./pages/staff/QuantityList";
import QuantityAddStaff from "./pages/staff/QuantityAdd";
import ProductListStaff from "./pages/staff/ProductList";
import OrderAddStaff from "./pages/staff/OrderAdd";
import OrderListStaff from "./pages/staff/OrderList";
import OrderDetailStaff from "./pages/staff/OrderDetail";




function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setLoading(false);
    };
    initAuth();
  }, []);

  if (loading) return <div className="p-4 text-center">Đang kiểm tra đăng nhập...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />}/>
        <Route path="/Forgot" element={<Forgot/>}/>
        <Route
          path="/AdminHome"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminHome />
            </PrivateRoute>
          }
        >
          <Route path="Shop/list" element={<ShopList />} />
          <Route path="Shop/add" element={<ShopAdd />} />
          <Route path="Staff/list" element={<StaffList />} />
          <Route path="Revenue/Overview" element={<AdminOverview />} />
          <Route path="Warehouse/list" element={<WarehouseList />} />
          <Route path="Category/list" element={<CategoryList />} />
          <Route path="Category/add" element={<CategoryAdd />} />
          <Route path="Product/list" element={<ProductList />} />
          <Route path="Product/add" element={<ProductAdd />} />
          <Route path="Quantity/add" element={<QuantityAdd />} />
          <Route path="Quantity/list" element={<QuantityList />} />
          <Route path="Customer/add" element={<CustomerAdd />} />
          <Route path="Customer/list" element={<CustomerList />} />
          <Route path="Orders/list" element={<OrderList />} />
          <Route path="Orders/add" element={<OrderAdd />} />
          <Route path="Orders/detail/:orderId" element={<OrderDetail/>}/>
          <Route path="Warehouse/Product" element={<WarehouseProduct/>}/>
          <Route path="Edit/shop/:id" element={<EditShop />} />
          <Route path="Warehouse/edit/:id" element={<EditWarehouse />} />
          <Route path="Category/edit/:id" element={<EditCategory />} />
          <Route path="Product/edit/:id" element={<EditProduct />} />
          

        </Route>


        <Route
          path="/Home"
          element={
            <PrivateRoute allowedRoles={["staff"]}>
              <StaffHome />
            </PrivateRoute>
          }
        >
          <Route path="Product/list"  element={<ProductListStaff />} />
          <Route path="Orders/list"   element={<OrderListStaff />} />
          <Route path="Orders/add"    element={<OrderAddStaff />} />
          <Route path="Orders/detail/:orderId" element={<OrderDetailStaff />} />
          <Route path="Quantity/add"  element={<QuantityAddStaff />} />
          <Route path="Quantity/list" element={<QuantityListStaff />} />
          <Route path="Customer/add"  element={<CustomerAdd />} />
          <Route path="Customer/list" element={<CustomerList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
