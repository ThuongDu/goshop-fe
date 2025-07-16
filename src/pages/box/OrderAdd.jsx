import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderCreate = () => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [orderItems, setOrderItems] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [cusId, setCusId] = useState(null);
  const [suggest, setSuggest] = useState([]);
  const [creating, setCreating] = useState(false);

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
    console.log('Call API: ', selectedShop, selectedWarehouse);
    axios.get(`http://localhost:3000/api/orders/products/${selectedShop}/${selectedWarehouse}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => {
      console.log('Products: ', r.data);
      setProducts(r.data);
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

  const addItem = () =>
    setOrderItems(p => [...p, { product_id: "", quantity: 1, price: 0, category_id: "", warehouse_id: selectedWarehouse }]);

  const changeItem = (i, f, v) => setOrderItems(p => {
    const arr = [...p];
    const it = { ...arr[i] };
    if (f === "product_id") {
      const prod = products.find(pr => pr.id === +v);
      if (prod) Object.assign(it, {
        product_id: prod.id,
        price: prod.price,
        category_id: prod.category_id
      });
    } else if (f === "quantity") {
      it.quantity = Math.max(1, v);
    }
    arr[i] = it;
    return arr;
  });

  const total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

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
    if (!cusId || !selectedShop || orderItems.length === 0) {
      alert("Vui lòng nhập đủ thông tin!");
      return;
    }
    try {
      const items = orderItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        category_id: item.category_id,
        warehouse_id: item.warehouse_id
      }));
      const res = await axios.post("http://localhost:3000/api/orders",
        { customer_id: cusId, shop_id: selectedShop, items },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Tạo đơn hàng thành công! Mã đơn: ${res.data.code}`);
      setOrderItems([]); setSelectedShop(""); setSelectedWarehouse("");
      setPhone(""); setName(""); setCusId(null);
    } catch (err) {
      console.error("Lỗi tạo đơn hàng:", err);
      alert(err.response?.data?.message || "Có lỗi khi tạo đơn hàng!");
    }
  };

  return (
    <div className="fw-full text-sm">
      <div className="bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Tạo đơn hàng</h1>
      </div>
      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-blue-800 text-white text-left">
                <th className="px-2 py-1 w-1/2">Cửa hàng</th>
                <th className="px-2 py-1 w-1/2">Kho</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-300">
                <td className="px-1 py-1">
                  <select value={selectedShop} onChange={e=>setSelectedShop(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md">
                    <option value="">-- Chọn --</option>
                    {shops.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </td>
                <td className="px-1 py-1">
                  <select value={selectedWarehouse} onChange={e=>setSelectedWarehouse(e.target.value)} disabled={!selectedShop} className="w-full px-4 py-2 border border-gray-300 rounded-md">
                    <option value="">-- Chọn --</option>
                    {warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Khách hàng */}
          <table className="w-full table-fixed mt-4">
            <thead>
              <tr className="bg-blue-800 text-white text-left">
                <th className="px-2 py-1 w-1/2">SĐT</th>
                <th className="px-2 py-1 w-1/2">Tên KH</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-300">
                <td className="px-1 py-1 relative">
                  <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Nhập SĐT" />
                  {suggest.length>0 && <ul className="absolute left-0 right-0 bg-white border rounded shadow z-10 max-h-40 overflow-y-auto">
                    {suggest.map(s=><li key={s.id} className="px-2 py-1 hover:bg-blue-50 cursor-pointer" onClick={()=>{setPhone(s.phone); setName(s.name); setCusId(s.id); setSuggest([]);}}>{s.name} - {s.phone}</li>)}
                  </ul>}
                </td>
                <td className="px-1 py-1">
                  <input value={name} onChange={e=>setName(e.target.value)} disabled={!!cusId} className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Tên khách" />
                </td>
              </tr>
            </tbody>
          </table>
          {!cusId && phone && name && <button type="button" onClick={saveCustomer} disabled={creating} className="text-blue-600 mt-2">+ Lưu khách mới</button>}

          {/* Sản phẩm */}
          <table className="w-full mt-6 border-collapse">
            <thead>
              <tr className="bg-blue-800 text-white text-left">
                <th className="border px-2 py-1">SP</th>
                <th className="border px-2 py-1">Danh mục</th>
                <th className="border px-2 py-1">SL</th>
                <th className="border px-2 py-1">Giá</th>
                <th className="border px-2 py-1">Tạm tính</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((it,i)=>(
                <tr key={i}>
                  <td className="border px-2 py-1">
                    <select value={it.product_id} onChange={e=>changeItem(i,"product_id",e.target.value)} className="w-full px-2 py-1 border rounded-md">
                      <option value="">-- Chọn --</option>
                      {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    {products.find(p=>p.id===it.product_id)?.category_name || ""}
                  </td>
                  <td className="border px-2 py-1 flex items-center space-x-1">
                    <button type="button" onClick={()=>changeItem(i,"quantity", it.quantity -1)} className="px-2 bg-gray-200 rounded">-</button>
                    <input type="number" min={1} value={it.quantity} onChange={e=>changeItem(i,"quantity",+e.target.value)} className="w-12 text-center border rounded-md" />
                    <button type="button" onClick={()=>changeItem(i,"quantity", it.quantity +1)} className="px-2 bg-gray-200 rounded">+</button>
                  </td>
                  <td className="border px-2 py-1 text-right">{it.price.toLocaleString()}₫</td>
                  <td className="border px-2 py-1 text-right">{(it.price*it.quantity).toLocaleString()}₫</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addItem} disabled={!selectedWarehouse} className="bg-blue-800 hover:bg-blue-900 text-white py-1 px-4 rounded-lg shadow mt-2">+ Thêm sản phẩm</button>

          {/* Tổng */}
          <div className="flex justify-end mt-6">
            <div className="w-full sm:w-1/2 md:w-1/3 bg-gray-50 border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between mb-1 text-sm">
                <span>Tạm tính</span>
                <span>{total.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Thuế (VAT&nbsp;8%)</span>
                <span>{Math.round(total*0.08).toLocaleString()}₫</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-semibold text-blue-700">
                <span>Tổng cộng</span>
                <span>{(total+Math.round(total*0.08)).toLocaleString()}₫</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <button type="submit" className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-8 rounded-lg shadow-md">Tạo đơn hàng</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderCreate;
