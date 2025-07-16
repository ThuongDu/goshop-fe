import React, { useEffect, useState } from "react";
import axios from "axios";

const QuantityAddStaff = () => {
  const token = localStorage.getItem("token");

  /* ─── state ─── */
  const [warehouses, setWarehouses]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [products,    setProducts]    = useState([]);

  const [currQty,     setCurrQty]     = useState({});   // {productId: qty hiện có}
  const [inputQty,    setInputQty]    = useState({});   // {productId: qty nhập thêm}

  const [selectedWh,  setSelectedWh]  = useState("");
  const [selectedCat, setSelectedCat] = useState("");

  const [msgErr, setErr]     = useState("");
  const [msgOk,  setOk]      = useState("");
  const [sending, setSend]   = useState(false);

  /* ─── 1. lấy warehouse theo staff ─── */
  useEffect(() => {
    (async () => {
      try{
        const { data } = await axios.get(
          "http://localhost:3000/api/staff/warehouses",
          { headers:{ Authorization:`Bearer ${token}` } }
        );
        setWarehouses(data);
      } catch(err){ console.error(err); }
    })();
  }, [token]);

  /* ─── 2. lấy category theo warehouse ─── */
  useEffect(() => {
    if(!selectedWh){
      setCategories([]); setSelectedCat("");
      return;
    }
    (async () => {
      try{
        const { data } = await axios.get(
          `http://localhost:3000/api/categories/warehouse/${selectedWh}`,
          { headers:{ Authorization:`Bearer ${token}` } }
        );
        setCategories(data);
      }catch(err){ console.error(err); }
    })();
  }, [selectedWh, token]);

  /* ─── 3. lấy products + tồn kho hiện tại ─── */
  useEffect(() => {
    if(!selectedWh || !selectedCat){
      setProducts([]); setCurrQty({}); setInputQty({});
      return;
    }
    (async () => {
      try{
        const { data: prod } = await axios.get(
          `http://localhost:3000/api/productcategories/category/${selectedCat}?warehouseId=${selectedWh}`,
          { headers:{ Authorization:`Bearer ${token}` } }
        );
        setProducts(prod);

        // lấy tồn hiện tại
        const ids = prod.map(p=>p.id).join(",");
        if(ids){
          const { data: qty } = await axios.get(
            `http://localhost:3000/api/quantities/current?warehouseId=${selectedWh}&productIds=${ids}`,
            { headers:{ Authorization:`Bearer ${token}` } }
          );
          setCurrQty(qty);            // api trả { product_id: total }
        }else{
          setCurrQty({});
        }
        setInputQty({});              // reset input
      }catch(err){ console.error(err); }
    })();
  }, [selectedWh, selectedCat, token]);

  /* ─── nhập số lượng change ─── */
  const onChangeQty = (id, val) => {
    setInputQty(prev => ({ ...prev, [id]: val }));
  };

  /* ─── submit ─── */
  const handleSubmit = async e => {
    e.preventDefault();
    setErr(""); setOk("");

    const items = products
      .filter(p => inputQty[p.id] && +inputQty[p.id] > 0)
      .map(p => ({
        product_id : p.id,
        image_id   : p.images?.[0]?.id || null,
        category_id: selectedCat,
        warehouse_id: selectedWh,
        quantity   : +inputQty[p.id]
      }));

    if(!selectedWh || !selectedCat || items.length===0){
      return setErr("Vui lòng chọn kho, danh mục và nhập số lượng hợp lệ!");
    }

    try{
      setSend(true);
      await Promise.all(items.map(it =>
        axios.post("http://localhost:3000/api/staff/quantity", it, {
          headers:{ Authorization:`Bearer ${token}` }
        })
      ));
      setOk("✔️ Nhập kho thành công!");
      setInputQty({});
      setTimeout(()=>setOk(""), 3000);
    }catch(err){
      console.error(err);
      setErr(err.response?.data?.message || "❌ Nhập kho thất bại");
    }finally{ setSend(false); }
  };

  /* ─── UI ─── */
  return (
    <div className="w-full text-sm">
      <div className="bg-white">
        <h1 className="text-2xl font-bold text-blue-800 py-5 px-5">Nhập kho (Staff)</h1>
      </div>

      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {msgErr && <p className="text-red-500 mb-4">{msgErr}</p>}
        {msgOk  && <p className="text-green-600 mb-4">{msgOk}</p>}

        <form onSubmit={handleSubmit}>
          {/* chọn kho + danh mục */}
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-blue-800 text-white text-left">
                <th className="px-2 py-2 w-1/2">Kho</th>
                <th className="px-2 py-2 w-1/2">Danh mục</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-1 py-1">
                  <select value={selectedWh} onChange={e=>setSelectedWh(e.target.value)}
                    className="w-full border rounded px-4 py-2">
                    <option value="">-- Chọn kho --</option>
                    {warehouses.map(w=>(
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-1 py-1">
                  <select value={selectedCat} onChange={e=>setSelectedCat(e.target.value)}
                    className="w-full border rounded px-4 py-2">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c=>(
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          {/* bảng sản phẩm */}
          <table className="w-full table-fixed mt-4">
            <thead>
              <tr className="bg-blue-800 text-white text-left">
                <th className="px-2 py-2 w-1/3">Tên sản phẩm</th>
                <th className="px-2 py-2 w-1/5">Ảnh</th>
                <th className="px-2 py-2 w-1/5">Tồn hiện tại</th>
                <th className="px-2 py-2 w-1/5">Nhập thêm</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p=>(
                <tr key={p.id} className="border-t">
                  <td className="px-1 py-1">{p.name}</td>
                  <td className="px-1 py-1">
                    {p.images?.length ? (
                      <img src={`http://localhost:3000/${p.images[0].url}`}
                           alt="" className="w-20 h-20 object-cover rounded border" />
                    ) : <span className="text-gray-400 italic">—</span>}
                  </td>
                  <td className="px-1 py-1 text-center">
                    {currQty[p.id] ?? 0}
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" min="0"
                      value={inputQty[p.id] || ""}
                      onChange={e=>onChangeQty(p.id, e.target.value)}
                      className="w-full border rounded px-3 py-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length>0 && (
            <div className="text-center mt-5">
              <button type="submit" disabled={sending}
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-6 rounded shadow">
                {sending ? "Đang lưu..." : "+ Thêm số lượng"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default QuantityAddStaff;
