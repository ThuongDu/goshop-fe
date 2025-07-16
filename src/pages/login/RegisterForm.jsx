import { useState, useEffect } from "react";
import axios from "axios";

function RegisterForm({ switchToLogin }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [shopId, setShopId] = useState("");
  const [shops, setShops] = useState([]);


  useEffect(() => {
    axios.get("http://localhost:3000/api/shops")
      .then(res => setShops(res.data))
      .catch(err => console.error("Lỗi load shop:", err));
  }, []);

  const handleRegister = async () => {
    if (!shopId) {
      alert("Nhân viên phải chọn cửa hàng!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/auth/register", {
        name,
        phone,
        password,
        role: "staff",
        shop_id: shopId,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      alert("Đăng ký thành công!");
    } catch (err) {
      alert("Đăng ký thất bại!");
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div >
      <input
        type="text"
        placeholder="Họ tên"
        className="w-full p-2 border mb-3 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Số điện thoại"
        className="w-full p-2 border mb-3 rounded"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="password"
        placeholder="Mật khẩu"
        className="w-full p-2 border mb-3 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
        className="w-full p-2 border mb-4 rounded"
        value={shopId}
        onChange={(e) => setShopId(e.target.value)}
      >
        <option value="">-- Chọn cửa hàng --</option>
        {shops.map((shop) => (
          <option key={shop.id} value={shop.id}>
            {shop.name}
          </option>
        ))}
      </select>

      <button
        className="w-full bg-blue-400 text-white p-2 rounded hover:bg-blue-800"
        onClick={handleRegister}
      >
        Đăng ký
      </button>
    </div>
  );
}

export default RegisterForm;