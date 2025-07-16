import axios from "axios";

export async function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await axios.get("http://localhost:3000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.setItem("user", JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    console.error("Xác thực thất bại:", err);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
}