import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!phone || !newPassword) {
      return alert("Vui lòng nhập số điện thoại và mật khẩu mới!");
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:3000/api/auth/forgot", {
        phone,
        newPassword,
      });
      alert("Đặt lại mật khẩu thành công!");
      navigate("/"); 
    } catch (err) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.message || "Không xác định"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-3">
        <h2 className="text-2xl text-blue-800 font-bold mb-4 text-center">Quên mật khẩu</h2>
        <input
          type="text"
          placeholder="Số điện thoại"
          className="w-full p-2 border rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="w-full p-2 border rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          onClick={handleResetPassword}
          disabled={loading}
          className={`w-full bg-blue-800 text-white p-2 rounded hover:bg-blue-600 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </button>
        <p className="text-center text-sm">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => navigate("/")}
          >
            Quay lại đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
