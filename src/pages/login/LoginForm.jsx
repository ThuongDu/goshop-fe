import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn reload trang

    if (!phone || !password) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        phone,
        password,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Đăng nhập thành công!");

      if (user.role === "admin") {
        return navigate("/AdminHome/Revenue/Overview", { replace: true });
      } else if (user.role === "staff") {
        return navigate("/Home", { replace: true });
      } else {
        alert("Role không hợp lệ!");
      }
    } catch (err) {
      console.error(err);
      alert("Đăng nhập thất bại: " + (err.response?.data?.message || "Lỗi không xác định."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-3">
      <input
        type="text"
        placeholder="Số điện thoại"
        className="w-full p-2 border rounded"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        className="w-full p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <div className="flex justify-end">
        <button
          type="button"
          className="text-blue-600 text-sm hover:underline"
          onClick={() => navigate("/Forgot")}
        >
          Quên mật khẩu?
        </button>
      </div>

      <button
        type="submit"
        className={`w-full bg-blue-800 text-white p-2 rounded hover:bg-blue-600 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        disabled={loading}
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}

export default LoginForm;
