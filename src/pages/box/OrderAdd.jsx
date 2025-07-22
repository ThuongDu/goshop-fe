import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";

Modal.setAppElement("#root");

const OrderCreate = () => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [cusId, setCusId] = useState(null);
  const [suggest, setSuggest] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("tiền mặt");
  const [showQR, setShowQR] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([
          axios.get("http://localhost:3000/api/shops", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3000/api/customers", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setShops(s.data);
        setCustomers(c.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!selectedShop) {
      setWarehouses([]);
      setSelectedWarehouse("");
      setProducts([]);
      setOrderItems([]);
      return;
    }
    axios
      .get(`http://localhost:3000/api/warehouses/shop/${selectedShop}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => {
        setWarehouses(r.data);
        setSelectedWarehouse("");
        setProducts([]);
        setOrderItems([]);
      })
      .catch((err) => console.error("Lỗi load kho:", err));
  }, [selectedShop, token]);

  useEffect(() => {
    if (!selectedWarehouse || !selectedShop) {
      setProducts([]);
      setOrderItems([]);
      return;
    }
    axios
      .get(`http://localhost:3000/api/orders/products/${selectedShop}/${selectedWarehouse}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => {
        const unique = [];
        const seen = new Set();
        const now = new Date();
        for (const item of r.data) {
          if (!seen.has(item.id) && (!item.expiry_date || new Date(item.expiry_date) >= now)) {
            unique.push(item);
            seen.add(item.id);
          }
        }
        setProducts(unique);
      })
      .catch((err) => console.error("Lỗi load SP:", err));
  }, [selectedShop, selectedWarehouse, token]);

  useEffect(() => {
    if (!phone) {
      setSuggest([]);
      setCusId(null);
      setName("");
      return;
    }
    const matches = customers.filter((c) => c.phone.includes(phone));
    setSuggest(matches);
    if (matches.length === 1 && matches[0].phone === phone) {
      setCusId(matches[0].id);
      setName(matches[0].name);
    } else {
      setCusId(null);
    }
  }, [phone, customers]);

  const addItem = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const price = product.sale_price > 0 ? product.sale_price : product.price;
      if (price <= 0) {
        console.warn(`Giá sản phẩm ID ${productId} không hợp lệ: ${price}`);
        return;
      }
      setOrderItems((prev) => [
        ...prev,
        {
          product_id: product.id,
          product_code: product.code,
          product_name: product.name,
          quantity: 1,
          price: price,
          category_id: product.category_id,
        },
      ]);
    }
  };

  const changeItem = (index, field, value) => {
    setOrderItems((prev) => {
      const arr = [...prev];
      const item = { ...arr[index] };
      if (field === "quantity") {
        item.quantity = Math.max(1, value);
      }
      arr[index] = item;
      return arr;
    });
  };

  const removeItem = (index) => {
    setOrderItems((items) => items.filter((_, i) => i !== index));
  };

  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const saveCustomer = async () => {
    if (!phone || !name) return;
    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/orders/create-customer",
        { name, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCusId(data.customer_id);
      setCustomers((prev) => [...prev, { id: data.customer_id, name, phone }]);
    } catch (err) {
      console.error("Lỗi lưu khách hàng:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cusId || !selectedShop || !selectedWarehouse || orderItems.length === 0) {
      alert("Vui lòng nhập đủ thông tin: khách hàng, cửa hàng, kho và sản phẩm!");
      return;
    }

    if (!["tiền mặt", "chuyển khoản"].includes(paymentMethod)) {
      alert("Phương thức thanh toán không hợp lệ!");
      return;
    }

    console.log("Payload gửi đi:", {
      customer_id: cusId,
      shop_id: selectedShop,
      warehouse_id: selectedWarehouse,
      items: orderItems,
      payment_method: paymentMethod,
    });

    if (paymentMethod === "chuyển khoản") {
      const qrURL = `https://img.vietqr.io/image/MB-0353190026-print.png?amount=${total}&addInfo=THANH+TOAN+DON+HANG&accountName=NGUYEN ANH DU THUONG`;
      setQrCodeData(qrURL);
      setShowQR(true);
      return;
    }

    try {
      const items = orderItems.map((item) => ({
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        quantity: item.quantity,
        category_id: item.category_id,
        warehouse_id: selectedWarehouse,
      }));

      const res = await axios.post(
        "http://localhost:3000/api/orders",
        {
          customer_id: cusId,
          shop_id: selectedShop,
          warehouse_id: selectedWarehouse,
          items,
          payment_method: paymentMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Response từ server:", res.data);
      alert(`✅ Tạo đơn hàng thành công! Mã: ${res.data.code}`);
      setOrderItems([]);
      setSelectedShop("");
      setSelectedWarehouse("");
      setPhone("");
      setName("");
      setCusId(null);
      setSuggest([]);
    } catch (err) {
      console.error("Lỗi tạo đơn hàng:", err);
      alert(err.response?.data?.message || "Có lỗi khi tạo đơn hàng!");
    }
  };

  const handleQRPaymentSuccess = async () => {
    try {
      const items = orderItems.map((item) => ({
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        quantity: item.quantity,
        category_id: item.category_id,
        warehouse_id: selectedWarehouse,
      }));

      const res = await axios.post(
        "http://localhost:3000/api/orders",
        {
          customer_id: cusId,
          shop_id: selectedShop,
          warehouse_id: selectedWarehouse,
          items,
          payment_method: paymentMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Response từ server sau QR:", res.data);
      alert(`✅ Thanh toán và tạo đơn hàng thành công! Mã: ${res.data.code}`);
      setShowQR(false);
      setOrderItems([]);
      setSelectedShop("");
      setSelectedWarehouse("");
      setPhone("");
      setName("");
      setCusId(null);
      setSuggest([]);
    } catch (err) {
      console.error("Lỗi tạo đơn hàng sau QR:", err);
      alert(err.response?.data?.message || "Có lỗi khi tạo đơn hàng sau thanh toán!");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full text-sm bg-gray-100 min-h-screen p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex-grow">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Nhập số điện thoại"
                />
                {suggest.length > 0 && (
                  <ul className="absolute bg-white border rounded shadow z-10 max-h-40 overflow-y-auto">
                    {suggest.map((s) => (
                      <li
                        key={s.id}
                        className="px-2 py-1 hover:bg-blue-50 cursor-pointer"
                        onClick={() => {
                          setPhone(s.phone);
                          setName(s.name);
                          setCusId(s.id);
                          setSuggest([]);
                        }}
                      >
                        {s.name} - {s.phone}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Tên khách hàng</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!!cusId}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Tên khách hàng"
                />
              </div>
            </div>
            {!cusId && phone && name && (
              <button
                type="button"
                onClick={saveCustomer}
                className="bg-blue-800 text-white py-1 px-4 rounded-md mb-4"
              >
                + Lưu khách mới
              </button>
            )}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Sản phẩm đã chọn</h3>
              {orderItems.length > 0 ? (
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{item.product_name}</div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Xóa
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => changeItem(index, "quantity", item.quantity - 1)}
                            className="px-2 bg-gray-200 rounded"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => changeItem(index, "quantity", +e.target.value)}
                            className="w-12 text-center border rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => changeItem(index, "quantity", item.quantity + 1)}
                            className="px-2 bg-gray-200 rounded"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          {(item.price * item.quantity).toLocaleString()}₫
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có sản phẩm nào được chọn</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sticky bottom-0">
            <div className="flex justify-between font-bold text-lg mb-3">
              <span>Tổng tiền:</span>
              <span>{total.toLocaleString()}₫</span>
            </div>
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Phương thức thanh toán</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="tiền mặt"
                    checked={paymentMethod === "tiền mặt"}
                    onChange={() => setPaymentMethod("tiền mặt")}
                    className="mr-2"
                  />
                  Tiền mặt
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="chuyển khoản"
                    checked={paymentMethod === "chuyển khoản"}
                    onChange={() => setPaymentMethod("chuyển khoản")}
                    className="mr-2"
                  />
                  Chuyển khoản
                </label>
              </div>
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!cusId || orderItems.length === 0}
              className={`w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md ${
                !cusId || orderItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Thanh Toán
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold mb-2">Chọn cửa hàng</h3>
              <select
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Chọn cửa hàng --</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Chọn kho</h3>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                disabled={!selectedShop}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Chọn kho --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!selectedWarehouse}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto p-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-2 border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer"
                onClick={() => addItem(product.id)}
              >
                <div className="font-semibold text-sm line-clamp-1">{product.name}</div>
                <div className="text-blue-800 font-semibold text-sm">
                  {(product.sale_price > 0 ? product.sale_price : product.price).toLocaleString()}₫
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal
        isOpen={showQR}
        onRequestClose={() => setShowQR(false)}
        contentLabel="QR Code Payment"
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Quét mã QR để thanh toán</h2>
        <div className="text-center mb-2 text-lg font-bold">
          {total.toLocaleString()}₫
        </div>
        <div className="flex justify-center mb-4">
          <img src={qrCodeData} alt="QR VietQR" className="border p-2" />
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowQR(false)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={handleQRPaymentSuccess}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Đã thanh toán
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default OrderCreate;