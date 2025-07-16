import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStore, FaWarehouse, FaBoxOpen, FaClipboardList, FaUsers } from "react-icons/fa";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    shops: 0,
    warehouses: 0,
    products: 0,
    orders: 0,
    staffs: 0,
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return <div className="text-center mt-10 text-xl font-semibold">Loading overview...</div>;
  }

  return (
    <div className="w-full text-sm">
      <div className="bg-white mb-5">
        <h1 className="text-3xl font-bold text-blue-800 py-5">Tổng quan</h1>
      </div>

    <div className="px-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="flex flex-col items-center bg-gradient-to-tr from-blue-500 to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform">
          <FaStore className="text-5xl mb-2" />
          <p className="text-4xl font-bold">{stats.shops}</p>
          <p className="text-base mt-1">Shops</p>
          <span className="text-xs mt-1 opacity-70">All branches</span>
        </div>

        <div className="flex flex-col items-center bg-gradient-to-tr from-green-500 to-green-700 text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform">
          <FaWarehouse className="text-5xl mb-2" />
          <p className="text-4xl font-bold">{stats.warehouses}</p>
          <p className="text-base mt-1">Warehouses</p>
          <span className="text-xs mt-1 opacity-70">Storage units</span>
        </div>

        <div className="flex flex-col items-center bg-gradient-to-tr from-yellow-400 to-yellow-600 text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform">
          <FaBoxOpen className="text-5xl mb-2" />
          <p className="text-4xl font-bold">{stats.products}</p>
          <p className="text-base mt-1">Products</p>
          <span className="text-xs mt-1 opacity-70">In system</span>
        </div>

        <div className="flex flex-col items-center bg-gradient-to-tr from-purple-500 to-purple-700 text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform">
          <FaClipboardList className="text-5xl mb-2" />
          <p className="text-4xl font-bold">{stats.orders}</p>
          <p className="text-base mt-1">Orders</p>
          <span className="text-xs mt-1 opacity-70">Completed & pending</span>
        </div>

        <div className="flex flex-col items-center bg-gradient-to-tr from-pink-500 to-pink-700 text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform">
          <FaUsers className="text-5xl mb-2" />
          <p className="text-4xl font-bold">{stats.staffs}</p>
          <p className="text-base mt-1">Staffs</p>
          <span className="text-xs mt-1 opacity-70">Active accounts</span>
        </div>
      </div>
    </div>
      
    </div>
  );
};

export default AdminOverview;
