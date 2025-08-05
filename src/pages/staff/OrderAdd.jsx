import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Modal from "react-modal";
import { saveAs } from "file-saver";

Modal.setAppElement("#root");

const OrderAddStaff = () => {
  const [shop, setShop] = useState({ id: "", name: "", address: "" });
  const [products, setProducts] = useState([]);
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
  const [showBillModal, setShowBillModal] = useState(false);
  const [billDetails, setBillDetails] = useState({ shopName: "", shopAddress: "", orderCode: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const formatCurrency = (num) => (num || num === 0 ? Number(num).toLocaleString("vi-VN") + "₫" : "—");
  const formatDate = (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "Không giới hạn");
  const formatWeight = (weight) => (weight || weight === 0 ? Math.round(weight) : "—");

  const total = orderItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const tax = Math.round(total * 0.08);
  const totalWithTax = total + tax;

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [userRes, customersRes] = await Promise.all([
          axios.get("http://localhost:3000/api/staff/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/customers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!userRes.data.shop_id) {
          throw new Error("Nhân viên chưa được gán cửa hàng");
        }

        setShop({
          id: userRes.data.shop_id,
          name: userRes.data.shop_name || "Unknown Shop",
          address: userRes.data.shop_address || "Không có địa chỉ",
        });

        if (!Array.isArray(customersRes.data)) {
          throw new Error("Dữ liệu khách hàng không hợp lệ");
        }
        setCustomers(customersRes.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [token]);

  useEffect(() => {
    if (!shop.id) {
      setProducts([]);
      setOrderItems([]);
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/api/staff/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!Array.isArray(res.data)) {
          throw new Error("Dữ liệu sản phẩm không hợp lệ");
        }

        // Deduplicate products by product_quantity_id
        const seen = new Set();
        const unique = res.data.filter((item) => {
          const key = `${item.product_id}-${item.expiry_date || "no-expiry"}`;
          if (seen.has(key)) {
            console.warn(`Duplicate product detected: product_id=${item.product_id}, expiry_date=${item.expiry_date}`);
            return false;
          }
          seen.add(key);
          return true;
        }).map((item, index) => ({
          ...item,
          product_quantity_id: `${item.product_id}-${item.expiry_date || "no-expiry"}-${index}`, // Ensure unique key
          isExpired: item.expiry_date && new Date(item.expiry_date) < new Date(),
          category_id: item.category_id || null,
        }));

        setProducts(unique);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải danh sách sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [shop.id, token]);

  useEffect(() => {
    if (!phone) {
      setSuggest([]);
      setCusId(null);
      setName("");
      return;
    }

    const matches = customers.filter((c) => c.phone?.includes(phone));
    setSuggest(matches);
    if (matches.length === 1 && matches[0].phone === phone) {
      setCusId(matches[0].id);
      setName(matches[0].name);
    } else {
      setCusId(null);
    }
  }, [phone, customers]);

  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  const addItem = useCallback((productQuantityId) => {
    const product = products.find((p) => p.product_quantity_id === productQuantityId);
    if (!product || product.isExpired || product.quantity < 1) {
      setError("Sản phẩm không khả dụng hoặc đã hết hàng");
      return;
    }

    const price = product.sale_price > 0 ? product.sale_price : product.price;
    if (price < 0) {
      setError(`Giá sản phẩm ${product.name} không hợp lệ`);
      return;
    }

    setOrderItems((prev) => {
      const existingItem = prev.find(
        (item) => item.product_id === product.product_id && item.expiry_date === product.expiry_date
      );
      
      if (existingItem) {
        if (existingItem.quantity + 1 > product.quantity) {
          setError(`Không đủ số lượng cho sản phẩm ${product.name}`);
          return prev;
        }
        return prev.map((item) =>
          item.product_id === product.product_id && item.expiry_date === product.expiry_date
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      if (product.quantity < 1) {
        setError(`Không đủ số lượng cho sản phẩm ${product.name}`);
        return prev;
      }

      return [
        ...prev,
        {
          product_id: product.product_id,
          product_code: product.code,
          product_name: product.name,
          quantity: 1,
          price: Number(price),
          category_id: product.category_id || null,
          weight: product.weight,
          unit: product.unit,
          expiry_date: product.expiry_date || null,
        },
      ];
    });
  }, [products]);

  const changeItem = useCallback((index, field, value) => {
    setOrderItems((prev) => {
      const arr = [...prev];
      const item = { ...arr[index] };
      if (field === "quantity") {
        const maxQuantity = products.find(
          (p) => p.product_id === item.product_id && p.expiry_date === item.expiry_date
        )?.quantity || 1;
        item.quantity = Math.max(1, Math.min(Number(value) || 1, maxQuantity));
      }
      arr[index] = item;
      return arr;
    });
  }, [products]);

  const removeItem = useCallback((index) => {
    setOrderItems((items) => items.filter((_, i) => i !== index));
  }, []);

  const saveCustomer = async () => {
    if (!phone || !name) {
      setError("Vui lòng nhập đầy đủ tên và số điện thoại");
      return;
    }
    
    if (!validatePhone(phone)) {
      setError("Số điện thoại không hợp lệ (cần 10 số)");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/staff/customers",
        { name, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCusId(data.customer_id);
      setCustomers((prev) => [...prev, { id: data.customer_id, name, phone, created_at: new Date() }]);
      setSuggest([]);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Không thể lưu khách hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const generateInvoice = async (orderCode, shopName = "Không có cửa hàng") => {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Ho_Chi_Minh",
    };
    const formattedDate = now.toLocaleString("en-US", options).replace(" at ", " ").replace(":00 ", " ");

    const latexContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{vietnam}
\\usepackage{geometry}
\\usepackage{array}
\\usepackage{booktabs}
\\usepackage{siunitx}
\\usepackage{fontspec}
\\setmainfont{Noto Serif}

\\geometry{a4paper, margin=2cm}
\\begin{document}

\\begin{center}
  \\textbf{\\Large HÓA ĐƠN BÁN HÀNG} \\\\
  \\vspace{0.5cm}
  \\textbf{Cửa hàng:} ${shopName.replace(/[&%$#_{}]/g, "\\$&")} \\\\
  \\textbf{Mã đơn hàng:} ${orderCode.replace(/[&%$#_{}]/g, "\\$&")} \\\\
  \\textbf{Ngày:} ${formattedDate} \\\\
\\end{center}

\\vspace{0.5cm}

\\noindent
\\textbf{Khách hàng:} ${name.replace(/[&%$#_{}]/g, "\\$&")} \\quad \\textbf{Số điện thoại:} ${phone.replace(/[&%$#_{}]/g, "\\$&")} \\\\
\\textbf{Phương thức thanh toán:} ${paymentMethod.replace(/[&%$#_{}]/g, "\\$&")} \\\\

\\vspace{0.5cm}

\\begin{tabular}{>{\\raggedright\\arraybackslash}p{5cm} r r r}
  \\toprule
  \\textbf{Sản phẩm} & \\textbf{Số lượng} & \\textbf{Đơn giá} & \\textbf{Thành tiền} \\\\
  \\midrule
  ${
    orderItems.length > 0
      ? orderItems
          .map(
            (item) =>
              `${item.product_name.replace(/[&%$#_{}]/g, "\\$&")} & ${item.quantity} & ${formatCurrency(item.price)} & ${formatCurrency(item.price * item.quantity)} \\\\`
          )
          .join("\n  ")
      : "\\multicolumn{4}{c}{Không có sản phẩm} \\\\"
  }
  \\midrule
  \\multicolumn{3}{r}{\\textbf{Tổng cộng:}} & \\textbf{${formatCurrency(total)}} \\\\
  \\multicolumn{3}{r}{\\textbf{Thuế VAT (8%):}} & \\textbf{${formatCurrency(tax)}} \\\\
  \\multicolumn{3}{r}{\\textbf{Tổng tiền (bao gồm VAT):}} & \\textbf{${formatCurrency(totalWithTax)}} \\\\
  \\bottomrule
\\end{tabular}

\\vspace{1cm}

\\noindent
\\textbf{Ghi chú:} Hóa đơn được tạo tự động bởi hệ thống. Vui lòng kiểm tra kỹ thông tin.

\\end{document}
    `;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/generate-invoice",
        { latexContent, orderCode },
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      saveAs(blob, `invoice_${orderCode}.pdf`);
    } catch (err) {
      console.error("Lỗi tạo PDF hóa đơn:", err);
      alert("Không thể tạo PDF hóa đơn. Đang tải file .tex thay thế.");
      const blob = new Blob([latexContent], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `invoice_${orderCode}.tex`);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = useCallback(async () => {
    const items = orderItems.map((item) => {
      if (!item.product_id || !item.quantity || !item.price || !item.product_code || !item.product_name) {
        throw new Error(`Thông tin sản phẩm không hợp lệ: ${item.product_name}`);
      }
      return {
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        quantity: item.quantity,
        price: Number(item.price),
        category_id: item.category_id || null,
        expiry_date: item.expiry_date || undefined,
      };
    });

    const response = await axios.post(
      "http://localhost:3000/api/orders/ordersstaff",
      {
        customer_id: cusId,
        items,
        payment_method: paymentMethod,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  }, [cusId, orderItems, paymentMethod, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cusId || orderItems.length === 0) {
      setError("Vui lòng nhập đủ thông tin: khách hàng và sản phẩm!");
      return;
    }

    if (!["tiền mặt", "chuyển khoản"].includes(paymentMethod)) {
      setError("Phương thức thanh toán không hợp lệ!");
      return;
    }

    setIsLoading(true);
    try {
      if (paymentMethod === "chuyển khoản") {
        const qrURL = `https://img.vietqr.io/image/MB-0353190026-print.png?amount=${totalWithTax}&addInfo=THANH+TOAN+DON+HANG&accountName=NGUYEN ANH DU THUONG`;
        setQrCodeData(qrURL);
        setShowQR(true);
        return;
      }

      const { code } = await createOrder();
      setBillDetails({
        shopName: shop.name,
        shopAddress: shop.address,
        orderCode: code,
      });
      setShowBillModal(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi khi tạo đơn hàng!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRPaymentSuccess = async () => {
    setIsLoading(true);
    try {
      const { code } = await createOrder();
      setBillDetails({
        shopName: shop.name,
        shopAddress: shop.address,
        orderCode: code,
      });
      setShowQR(false);
      setShowBillModal(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi khi tạo đơn hàng sau thanh toán!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadBill = async () => {
    await generateInvoice(billDetails.orderCode, billDetails.shopName);
    setShowBillModal(false);
    setOrderItems([]);
    setPhone("");
    setName("");
    setCusId(null);
    setSuggest([]);
    setError("");
  };

  const filteredProducts = products.filter(
    (product) => !product.isExpired && product.quantity > 0 && product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full text-sm bg-gray-100 min-h-screen p-4">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && <p className="text-center mt-8 text-red-500">{error}</p>}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex-grow">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <label className="block text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Nhập số điện thoại"
                  disabled={isLoading}
                />
                {suggest.length > 0 && (
                  <ul className="absolute bg-white border rounded shadow z-10 max-h-40 overflow-y-auto mt-1 w-full">
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
                  onChange={(e) => setName(e.target.value.trim())}
                  disabled={!!cusId || isLoading}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Tên khách hàng"
                />
              </div>
            </div>
            {!cusId && phone && name && (
              <button
                type="button"
                onClick={saveCustomer}
                disabled={isLoading}
                className={`bg-blue-800 text-white py-1 px-4 rounded-md mb-4 hover:bg-blue-900 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                + Lưu khách mới
              </button>
            )}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Sản phẩm đã chọn</h3>
              {orderItems.length > 0 ? (
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={`${item.product_id}-${item.expiry_date || "no-expiry"}`} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{item.product_name}</div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={isLoading}
                        >
                          Xóa
                        </button>
                      </div>
                      <div className="text-gray-600 text-sm">
                        Giá: {formatCurrency(item.price)}
                        {item.sale_price > 0 && (
                          <span className="text-gray-500 line-through ml-2">
                            Giá gốc: {formatCurrency(item.sale_price)}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 text-sm">
                        Trọng lượng: {formatWeight(item.weight)} {item.unit || ""}
                      </div>
                      <div className="text-gray-600 text-sm">
                        Hạn sử dụng: {formatDate(item.expiry_date)}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => changeItem(index, "quantity", item.quantity - 1)}
                            className="px-2 bg-gray-200 rounded"
                            disabled={item.quantity <= 1 || isLoading}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => changeItem(index, "quantity", +e.target.value)}
                            className="w-12 text-center border rounded-md"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => changeItem(index, "quantity", item.quantity + 1)}
                            className="px-2 bg-gray-200 rounded"
                            disabled={isLoading}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">{formatCurrency(item.price * item.quantity)}</div>
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
            <div className="flex justify-between font-bold text-lg mb-1">
              <span>Tổng tiền:</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-lg mb-1">
              <span>Thuế VAT (8%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mb-3">
              <span>Tổng tiền (bao gồm VAT):</span>
              <span>{formatCurrency(totalWithTax)}</span>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  Chuyển khoản
                </label>
              </div>
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!cusId || orderItems.length === 0 || isLoading}
              className={`w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md ${
                !cusId || orderItems.length === 0 || isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Thanh Toán
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-4">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Cửa hàng: {shop.name}</h3>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.trim())}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto p-2">
            {filteredProducts.map((product, index) => (
              <div
                key={`${product.product_quantity_id}-${index}`} // Ensure unique key by adding index
                className="relative p-2 border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer"
                onClick={() => !isLoading && addItem(product.product_quantity_id)}
              >
                <div className="font-semibold text-sm line-clamp-1">{product.name}</div>
                <div className="text-blue-800 font-semibold text-sm">
                  Giá: {formatCurrency(product.sale_price > 0 ? product.sale_price : product.price)}
                </div>
                {product.sale_price > 0 && (
                  <div className="text-gray-500 text-sm line-through">
                    Giá gốc: {formatCurrency(product.price)}
                  </div>
                )}
                <div className="text-gray-600 text-sm">
                  Trọng lượng: {formatWeight(product.weight)} {product.unit || ""}
                </div>
                <div className="text-gray-600 text-sm">
                  Hạn sử dụng: {formatDate(product.expiry_date)}
                </div>
                <div className="text-gray-600 text-sm">
                  Số lượng: {product.quantity}
                </div>
                <img
                  src={
                    product.images && product.images.length > 0
                      ? `http://localhost:3000/${product.images[0].url}`
                      : "/images/default-product.jpg"
                  }
                  alt={product.name}
                  className="mt-2 w-16 h-16 object-cover rounded"
                  onError={(e) => (e.target.src = "/images/default-product.jpg")}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal
        isOpen={showQR}
        onRequestClose={() => !isLoading && setShowQR(false)}
        contentLabel="QR Code Payment"
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Quét mã QR để thanh toán</h2>
        <p className="text-center text-sm text-gray-600 mb-4">Vui lòng quét mã QR và xác nhận thanh toán để hoàn tất đơn hàng.</p>
        <div className="text-center mb-2 text-lg font-bold">{formatCurrency(totalWithTax)}</div>
        <div className="flex justify-center mb-4">
          <img src={qrCodeData} alt="QR VietQR" className="border p-2" />
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowQR(false)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={handleQRPaymentSuccess}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={isLoading}
          >
            Đã thanh toán
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={showBillModal}
        onRequestClose={() => !isLoading && setShowBillModal(false)}
        contentLabel="Bill Preview"
        className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-20"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Chi tiết hóa đơn</h2>
        <div className="mb-4 max-h-96 overflow-y-auto">
          <p><strong>Cửa hàng:</strong> {billDetails.shopName}</p>
          <p><strong>Địa chỉ:</strong> {billDetails.shopAddress}</p>
          <p><strong>Mã đơn hàng:</strong> {billDetails.orderCode}</p>
          <p><strong>Ngày:</strong> {new Date().toLocaleDateString("vi-VN")}</p>
          <p><strong>Giờ:</strong> {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
          <p><strong>Khách hàng:</strong> {name}</p>
          <p><strong>Số điện thoại:</strong> {phone}</p>
          <p><strong>Phương thức thanh toán:</strong> {paymentMethod}</p>
          <h3 className="font-semibold mt-2">Sản phẩm:</h3>
          {orderItems.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Sản phẩm</th>
                  <th className="border p-2">Số lượng</th>
                  <th className="border p-2">Đơn giá</th>
                  <th className="border p-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, index) => (
                  <tr key={`${item.product_id}-${item.expiry_date || "no-expiry"}`}>
                    <td className="border p-2">
                      {item.product_name}
                      <div className="text-gray-600 text-xs">
                        Trọng lượng: {formatWeight(item.weight)} {item.unit || ""}
                      </div>
                      <div className="text-gray-600 text-xs">
                        Hạn sử dụng: {formatDate(item.expiry_date)}
                      </div>
                    </td>
                    <td className="border p-2 text-center">{item.quantity}</td>
                    <td className="border p-2 text-right">{formatCurrency(item.price)}</td>
                    <td className="border p-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="border p-2 font-semibold text-right">Tổng cộng:</td>
                  <td className="border p-2 text-right">{formatCurrency(total)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="border p-2 font-semibold text-right">Thuế VAT (8%):</td>
                  <td className="border p-2 text-right">{formatCurrency(tax)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="border p-2 font-semibold text-right">Tổng tiền (bao gồm VAT):</td>
                  <td className="border p-2 text-right">{formatCurrency(totalWithTax)}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="text-gray-500">Không có sản phẩm nào được chọn</p>
          )}
          <p className="mt-2"><strong>Ghi chú:</strong> Hóa đơn được tạo tự động bởi hệ thống. Vui lòng kiểm tra kỹ thông tin.</p>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowBillModal(false)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={handleDownloadBill}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            Tải PDF
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default OrderAddStaff;