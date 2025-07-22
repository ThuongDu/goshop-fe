import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const AdminStatistics = () => {
  const [stats, setStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueByShop, setRevenueByShop] = useState([]);
  const [revenueByStaff, setRevenueByStaff] = useState([]);
  const [todayRevenueByStaff, setTodayRevenueByStaff] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, monthlyRes, topRes, shopRes, staffRes, todayStaffRes] = await Promise.all([
          axios.get("http://localhost:3000/api/statistics", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3000/api/statistics/monthly-revenue", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3000/api/statistics/top-products", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3000/api/statistics/revenue-by-shop", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3000/api/statistics/revenue-by-staff", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3000/api/statistics/today-revenue-by-staff", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStats(statsRes.data);
        setMonthlyRevenue(monthlyRes.data);
        setTopProducts(topRes.data);
        setRevenueByShop(shopRes.data);
        setRevenueByStaff(staffRes.data);
        setTodayRevenueByStaff(todayStaffRes.data);
      } catch (err) {
        console.error("Lỗi load thống kê:", err);
      }
    };
    fetchAll();
  }, [token]);

  if (!stats) return <div className="text-center mt-10 text-lg font-semibold text-gray-600">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-700 mb-2">📊 Thống kê tổng quan</h1>

      {/* Tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Tổng đơn" value={stats.total_orders} color="from-blue-500 to-blue-400" />
        <StatCard label="Tổng doanh thu" value={Number(stats.total_revenue).toLocaleString()} suffix="₫" color="from-green-500 to-green-400" />
        <StatCard label="Khách hàng" value={stats.total_customers} color="from-purple-500 to-purple-400" />
        <StatCard label="Sản phẩm đã bán" value={stats.total_items_sold} color="from-pink-500 to-pink-400" />
      </div>

      {/* Doanh thu theo tháng */}
      <SectionCard title="📅 Doanh thu theo tháng">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.7} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Top sản phẩm */}
      <SectionCard title="🏆 Top 5 sản phẩm bán chạy">
        <ItemList data={topProducts} render={p => (
          <>
            <span>{p.name} ({p.code})</span>
            <span className="font-medium text-blue-600">Đã bán: {p.total_sold}</span>
          </>
        )} />
      </SectionCard>

      {/* Doanh thu theo cửa hàng */}
      <SectionCard title="🏬 Doanh thu theo cửa hàng">
        <ItemList data={revenueByShop} render={s => (
          <>
            <span>{s.name}</span>
            <span className="font-medium text-green-600">{Number(s.revenue).toLocaleString()}₫</span>
          </>
        )} />
      </SectionCard>

      {/* Doanh thu theo nhân viên */}
      <SectionCard title="👨‍💼 Doanh thu theo nhân viên">
        <ItemList data={revenueByStaff} render={s => (
          <>
            <span>{s.name}</span>
            <span className="font-medium text-purple-600">{Number(s.revenue).toLocaleString()}₫</span>
          </>
        )} />
      </SectionCard>

      <SectionCard title="📅 Doanh thu trong ngày theo nhân viên">
        <ItemList data={todayRevenueByStaff} emptyText="Chưa có dữ liệu hôm nay." render={s => (
          <>
            <span>{s.name}</span>
            <span className="font-medium text-orange-600">{Number(s.revenue).toLocaleString()}₫</span>
          </>
        )} />
      </SectionCard>
    </div>
  );
};

const StatCard = ({ label, value, suffix, color }) => (
  <div className={`p-4 rounded-2xl shadow-md text-center bg-gradient-to-br ${color} text-white`}>
    <p className="text-2xl font-bold">{value}{suffix && suffix}</p>
    <p className="text-sm">{label}</p>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <h2 className="text-lg font-semibold mb-3 text-gray-700">{title}</h2>
    {children}
  </div>
);

const ItemList = ({ data, render, emptyText = "Không có dữ liệu" }) => (
  data.length === 0 ? <p className="text-gray-500">{emptyText}</p> :
    <ul className="divide-y divide-gray-100">
      {data.map(item => (
        <li key={item.id} className="py-2 flex justify-between">{render(item)}</li>
      ))}
    </ul>
);

export default AdminStatistics;
