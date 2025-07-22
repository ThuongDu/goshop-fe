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
  const [creating, setCreating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
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
      } catch (e) { console.error(e); }
    })();
  }, [token]);

  useEffect(() => {
    if (!selectedShop) {
      setWarehouses([]); setSelectedWarehouse("");
      setProducts([]); setOrderItems([]);
      return;
    }
    axios.get(`http://localhost:3000/api/warehouses/shop/${selectedShop}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        setWarehouses(r.data);
        setSelectedWarehouse("");
        setProducts([]); setOrderItems([]);
      })
      .catch(err => console.error('Lỗi load kho:', err));
  }, [selectedShop, token]);

  useEffect(() => {
    if (!selectedWarehouse || !selectedShop) {
      setProducts([]); setOrderItems([]);
      return;
    }
    axios.get(`http://localhost:3000/api/orders/products/${selectedShop}/${selectedWarehouse}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => {
      const unique = [];
      const seen = new Set();
      for (const item of r.data) {
        if (!seen.has(item.id)) {
          unique.push(item);
          seen.add(item.id);
        }
      }
      setProducts(unique);
    })
    .catch(err => console.error('Lỗi load SP:', err));
    setOrderItems([]);
  }, [selectedShop, selectedWarehouse, token]);

  useEffect(() => {
    if (!phone) {
      setSuggest([]); setCusId(null); setName("");
      return;
    }
    const m = customers.filter(c => c.phone.includes(phone));
    setSuggest(m);
    if (m.length === 1 && m[0].phone === phone) {
      setCusId(m[0].id); setName(m[0].name);
    } else {
      setCusId(null);
    }
  }, [phone, customers]);

  const addItem = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      if (!product.category_id) {
        alert(`Sản phẩm "${product.name}" chưa có danh mục. Vui lòng cập nhật trước khi thêm vào đơn hàng.`);
        return;
      }

      const effectivePrice = product.sale_price !== null && product.sale_price !== undefined
        ? product.sale_price
        : product.price;

      setOrderItems(p => [...p, {
        product_id: product.id,
        quantity: 1,
        price: effectivePrice,
        sale_price: product.sale_price,
        original_price: product.price,
        has_sale: product.sale_price !== null && product.sale_price !== undefined,
        product_name: product.name,
        image_url: product.image_url,
        description: product.description,
        category_id: product.category_id, 
        category_name: product.category_name 
      }]);
    }
  };

  const changeItem = (i, f, v) => setOrderItems(p => {
    const arr = [...p];
    const it = { ...arr[i] };
    if (f === "product_id") {
      const prod = products.find(pr => pr.id === +v);
      if (prod) Object.assign(it, {
        product_id: prod.id,
        price: prod.sale_price ?? prod.price,
        sale_price: prod.sale_price,
        original_price: prod.price,
        has_sale: prod.sale_price !== null && prod.sale_price !== undefined,
        category_id: prod.category_id,
        product_name: prod.name,
        image_url: prod.image_url,
        description: prod.description
      });
    } else if (f === "quantity") {
      it.quantity = Math.max(1, v);
    }
    arr[i] = it;
    return arr;
  });

  const removeItem = (index) => {
    setOrderItems(items => items.filter((_, i) => i !== index));
  };

  const total = orderItems.reduce((s, i) => {
    const itemPrice = i.sale_price ?? i.price;
    return s + itemPrice * i.quantity;
  }, 0);
  
  const saveCustomer = async () => {
    if (!phone || !name) return;
    setCreating(true);
    const { data } = await axios.post("http://localhost:3000/api/orders/create-customer", { name, phone }, { headers: { Authorization: `Bearer ${token}` } });
    setCusId(data.customer_id);
    setCustomers(c => [...c, { id: data.customer_id, name, phone }]);
    setCreating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cusId || !selectedShop || !selectedWarehouse || orderItems.length === 0) {
      alert("Vui lòng nhập đủ thông tin: khách hàng, cửa hàng, kho và sản phẩm!");
      return;
    }

    const hasMissingCategory = orderItems.some(item => !item.category_id);
    if (hasMissingCategory) {
      alert("Một số sản phẩm không có danh mục. Vui lòng kiểm tra lại!");
      return;
    }

    if (paymentMethod === "banking") {
      const qrURL = `https://img.vietqr.io/image/MB-0353190026-print.png?amount=${total}&addInfo=THANH+TOAN+DON+HANG&accountName=NGUYEN ANH DU THUONG`;
      setQrCodeData(qrURL);
      setShowQR(true);
      return;
    }

    try {
      const items = orderItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        sale_price: item.sale_price,
        category_id: item.category_id,
        warehouse_id: item.warehouse_id
      }));
      const res = await axios.post("http://localhost:3000/api/orders",
        { customer_id: cusId, 
          shop_id: selectedShop, 
          warehouse_id: selectedWarehouse,
          items, 
          payment_method: paymentMethod  },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ Tạo đơn hàng thành công! Mã: ${res.data.code}`);
      setOrderItems([]); setSelectedShop(""); setSelectedWarehouse("");
      setPhone(""); setName(""); setCusId(null); setSuggest([]);
    } catch (err) {
      console.error("Lỗi tạo đơn hàng:", err);
      alert(err.response?.data?.message || "Có lỗi khi tạo đơn hàng!");
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQRPaymentSuccess = async () => {
    try {
      const items = orderItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        sale_price: item.sale_price,
        category_id: item.category_id,
        warehouse_id: selectedWarehouse
      }));

      const res = await axios.post(
        "http://localhost:3000/api/orders",
        { 
          customer_id: cusId, 
          shop_id: selectedShop, 
          warehouse_id: selectedWarehouse,
          items, 
          payment_method: paymentMethod 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`✅ Thanh toán và tạo đơn hàng thành công! Mã: ${res.data.order_id}`);
      setShowQR(false);
      // Reset form
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

  return (
    <div className="w-full text-sm bg-gray-100 min-h-screen">
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex-grow">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      placeholder="Nhập số điện thoại"
                    />
                    {suggest.length > 0 && (
                      <ul className="absolute left-0 right-0 bg-white border rounded shadow z-10 max-h-40 overflow-y-auto">
                        {suggest.map(s => (
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
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Tên khách hàng</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
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
                  disabled={creating}
                  className="bg-blue-800 text-white py-1 px-4 rounded-md mb-4"
                >
                  {creating ? "Đang lưu..." : "+ Lưu khách mới"}
                </button>
              )}
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Sản phẩm đã chọn</h3>
                {orderItems.length > 0 ? (
                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <img 
                              src={item.image_url || ' '} 
                              alt={item.product_name} 
                              className="w-10 h-10 object-cover rounded mr-2"
                            />
                            <div>
                              <div className="font-medium">{item.product_name}</div>
                              <div className="text-xs text-gray-500">{item.description}</div>
                            </div>
                          </div>
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
                              onClick={() => {
                                if (item.quantity > 1) {
                                  changeItem(index, "quantity", item.quantity - 1);
                                }
                              }} 
                              className="px-2 bg-gray-200 rounded"
                            >
                              -
                            </button>
                            <input 
                              type="number" 
                              min={1} 
                              value={item.quantity} 
                              onChange={e => {
                                const value = Math.max(1, +e.target.value);
                                changeItem(index, "quantity", value);
                              }} 
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
                            {item.sale_price ? (
                              <>
                                <div className="text-red-600 font-medium">
                                  {(item.sale_price * item.quantity).toLocaleString()}₫
                                </div>
                                <div className="text-gray-500 text-sm line-through">
                                  {(item.price * item.quantity).toLocaleString()}₫
                                </div>
                              </>
                            ) : (
                              <div className="font-medium">
                                {(item.price * item.quantity).toLocaleString()}₫
                              </div>
                            )}
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
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                      className="mr-2"
                    />
                    Tiền mặt
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="banking"
                      checked={paymentMethod === "banking"}
                      onChange={() => setPaymentMethod("banking")}
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
                  !cusId || orderItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
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
                  onChange={e => setSelectedShop(e.target.value)} 
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Chọn cửa hàng --</option>
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Chọn kho</h3>
                <select 
                  value={selectedWarehouse} 
                  onChange={e => setSelectedWarehouse(e.target.value)} 
                  disabled={!selectedShop}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Chọn kho --</option>
                  {warehouses.map(w => (
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
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={!selectedWarehouse}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto p-2">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="p-2 border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer flex flex-col"
                  onClick={() => addItem(product.id)}
                >
                  <img 
                    src={product.image_url || ' '} 
                    alt={product.name} 
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <div className="font-semibold text-sm line-clamp-1">{product.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-2 mb-1">{product.description}</div>
                  <div className="flex items-center mt-auto">
                    {product.sale_price ? (
                      <>
                        <span className="text-red-600 font-semibold text-sm">
                          {product.sale_price.toLocaleString()}₫
                        </span>
                        <span className="text-gray-500 text-xs line-through ml-2">
                          {product.price.toLocaleString()}₫
                        </span>
                      </>
                    ) : (
                      <span className="text-blue-800 font-semibold text-sm">
                        {product.price.toLocaleString()}₫
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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