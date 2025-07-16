import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderAddStaff = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  const [categoriesList, setCategoriesList] = useState({}); // {product_id: [{id,name},…]}

  const [customers, setCustomers] = useState([]);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [cusId, setCusId] = useState(null);
  const [suggest, setSuggest] = useState([]);
  const [creating, setCreating] = useState(false);

  const token = localStorage.getItem("token");

  /* ───────── Load kho & KH ───────── */
  useEffect(() => {
    (async () => {
      try {
        const [w, c] = await Promise.all([
          axios.get("http://localhost:3000/api/staff/warehouses", { headers:{Authorization:`Bearer ${token}`} }),
          axios.get("http://localhost:3000/api/customers",        { headers:{Authorization:`Bearer ${token}`} })
        ]);
        setWarehouses(w.data);
        setCustomers(c.data);
      } catch(err){ console.error("Load data:", err); }
    })();
  }, [token]);

  /* ───────── Load SP theo kho ───────── */
  useEffect(() => {
    if (!selectedWarehouse){ setProducts([]); setOrderItems([]); return; }
    axios.get(`http://localhost:3000/api/staff/products?warehouse_id=${selectedWarehouse}`,
      { headers:{Authorization:`Bearer ${token}`} })
    .then(res => { setProducts(res.data); setOrderItems([]); })
    .catch(err => console.error("Load SP:", err));
  }, [selectedWarehouse, token]);

  /* ───────── Gợi ý KH ───────── */
  useEffect(() => {
    if (!phone){ setSuggest([]); setCusId(null); setName(""); return; }
    const m = customers.filter(c=>c.phone.includes(phone));
    setSuggest(m);
    if (m.length===1 && m[0].phone===phone){
      setCusId(m[0].id); setName(m[0].name);
    } else { setCusId(null); }
  }, [phone, customers]);

  /* ───────── Fetch categories của SP ───────── */
  const fetchCategories = async (product_id, idx) => {
    try{
      const {data} = await axios.get(
        `http://localhost:3000/api/products/${product_id}/categories`,
        { headers:{Authorization:`Bearer ${token}`} }
      );
      setCategoriesList(prev => ({...prev,[product_id]:data}));
      if (data.length===1){
        setOrderItems(prev=>{
          const arr=[...prev];
          arr[idx]={...arr[idx],category_id:data[0].id};
          return arr;
        });
      }
    }catch(err){ console.error("Load DM:", err); }
  };

  /* ───────── Thêm item ───────── */
  const addItem = () =>
    setOrderItems(p=>[...p,{
      product_id:"", quantity:1, price:0, category_id:"", warehouse_id:selectedWarehouse
    }]);

  const changeItem = (idx, field, value) =>
    setOrderItems(prev=>{
      const arr=[...prev];
      const it={...arr[idx]};
      if (field==="product_id"){
        const prod = products.find(p=>p.id===+value);
        if (prod){
          it.product_id=prod.id;
          it.price     =prod.price;
          it.category_id="";
          fetchCategories(prod.id, idx);
        }
      } else if (field==="quantity"){
        it.quantity=Math.max(1,+value);
      } else if (field==="category_id"){
        it.category_id=+value;
      }
      arr[idx]=it;
      return arr;
    });

  const total = orderItems.reduce((s,i)=>s+i.price*i.quantity,0);

  const saveCustomer = async () => {
    if (!phone || !name) return;
    setCreating(true);
    try{
      const {data}=await axios.post(
        "http://localhost:3000/api/orders/create-customer",
        {name,phone},{headers:{Authorization:`Bearer ${token}`}}
      );
      setCusId(data.customer_id);
      setCustomers(c=>[...c,{id:data.customer_id,name,phone}]);
    }catch(err){ alert("Lỗi tạo KH"); }
    setCreating(false);
  };

  const handleSubmit = async e=>{
    e.preventDefault();
    if (!cusId || !selectedWarehouse || orderItems.length===0){
      alert("Điền đủ thông tin!"); return;
    }
    // validate
    for (const it of orderItems){
      if (!it.product_id || !it.category_id){
        alert("Chưa chọn danh mục cho 1 sản phẩm"); return;
      }
    }
    setCreating(true);
    try{
      await axios.post("http://localhost:3000/api/orders/ordersstaff",
        {customer_id:cusId,items:orderItems},
        {headers:{Authorization:`Bearer ${token}`}}
      );
      alert("✅ Tạo đơn thành công");
      // reset
      setPhone(""); setName(""); setCusId(null);
      setSelectedWarehouse(""); setOrderItems([]);
    }catch(err){
      const msg = err.response?.data?.message || err.message;
      alert("Tạo đơn thất bại: "+msg);
    }
    setCreating(false);
  };

  return (
    <div className="fw-full text-sm">
      <div className="bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5">Tạo đơn hàng (Staff)</h1>
      </div>
      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          {/* KH */}
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-blue-800 text-white text-left">
                <th className="px-2 py-1 w-1/2">SĐT</th>
                <th className="px-2 py-1 w-1/2">Tên KH</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-300">
                <td className="px-1 py-1 relative">
                  <input value={phone} onChange={e=>setPhone(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md" placeholder="Nhập SĐT"/>
                  {suggest.length>0 && (
                    <ul className="absolute left-0 right-0 bg-white border rounded shadow z-10 max-h-40 overflow-y-auto">
                      {suggest.map(s=>(
                        <li key={s.id} className="px-2 py-1 hover:bg-blue-50 cursor-pointer"
                          onClick={()=>{setPhone(s.phone);setName(s.name);setCusId(s.id);setSuggest([]);}}>
                          {s.name} - {s.phone}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-1 py-1">
                  <input value={name} onChange={e=>setName(e.target.value)}
                    disabled={!!cusId}
                    className="w-full px-4 py-2 border rounded-md" placeholder="Tên khách"/>
                </td>
              </tr>
            </tbody>
          </table>
          {!cusId && phone && name && (
            <button type="button" onClick={saveCustomer} disabled={creating}
              className="text-blue-600 mt-2">+ Lưu khách mới</button>
          )}

          <div className="mt-4">
            <select value={selectedWarehouse} onChange={e=>setSelectedWarehouse(e.target.value)}
              className="w-full px-4 py-2 border rounded-md">
              <option value="">-- Chọn kho --</option>
              {warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

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
              {orderItems.map((it,idx)=>{
                const catOpts = categoriesList[it.product_id] || [];
                return (
                  <tr key={idx}>
                    <td className="border px-2 py-1">
                      <select value={it.product_id}
                        onChange={e=>changeItem(idx,"product_id",e.target.value)}
                        className="w-full px-2 py-1 border rounded-md">
                        <option value="">-- Chọn --</option>
                        {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td className="border px-2 py-1">
                      {catOpts.length>1 ? (
                        <select value={it.category_id}
                          onChange={e=>changeItem(idx,"category_id",e.target.value)}
                          className="w-full border px-2 py-1 rounded-md">
                          <option value="">-- Chọn --</option>
                          {catOpts.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      ) : (
                        catOpts[0]?.name || ""
                      )}
                    </td>
                    {/* SL */}
                    <td className="border px-2 py-1 flex items-center space-x-1">
                      <button type="button" onClick={()=>changeItem(idx,"quantity",it.quantity-1)}
                        className="px-2 bg-gray-200 rounded">-</button>
                      <input type="number" min={1} value={it.quantity}
                        onChange={e=>changeItem(idx,"quantity",e.target.value)}
                        className="w-12 text-center border rounded-md"/>
                      <button type="button" onClick={()=>changeItem(idx,"quantity",it.quantity+1)}
                        className="px-2 bg-gray-200 rounded">+</button>
                    </td>
                    <td className="border px-2 py-1 text-right">{it.price.toLocaleString()}₫</td>
                    <td className="border px-2 py-1 text-right">{(it.price*it.quantity).toLocaleString()}₫</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button type="button" onClick={addItem} disabled={!selectedWarehouse}
            className="bg-blue-800 hover:bg-blue-900 text-white py-1 px-4 rounded-lg shadow mt-2">
            + Thêm sản phẩm
          </button>

          <div className="flex justify-end mt-6">
            <div className="w-full sm:w-1/2 md:w-1/3 bg-gray-50 border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between mb-1 text-sm">
                <span>Tạm tính</span><span>{total.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Thuế (VAT 8%)</span><span>{Math.round(total*0.08).toLocaleString()}₫</span>
              </div>
              <hr className="my-2"/>
              <div className="flex justify-between text-lg font-semibold text-blue-700">
                <span>Tổng cộng</span><span>{(total+Math.round(total*0.08)).toLocaleString()}₫</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <button type="submit" disabled={creating}
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-8 rounded-lg shadow-md">
              {creating ? "Đang tạo..." : "Tạo đơn hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderAddStaff;
