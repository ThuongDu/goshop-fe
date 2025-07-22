import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ShopAdd = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(res.data);
      } catch (err) {
        console.error('Lỗi khi load tỉnh/thành phố:', err);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!province) {
        setDistricts([]); setDistrict(''); return;
      }
      const selected = provinces.find(p => p.name === province);
      if (!selected) return;
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/p/${selected.code}?depth=2`);
        setDistricts(res.data.districts);
        setDistrict(''); setWards([]); setWard('');
      } catch (err) {
        console.error('Lỗi load quận/huyện:', err);
      }
    };
    fetchDistricts();
  }, [province, provinces]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!district) { setWards([]); setWard(''); return; }
      const selected = districts.find(d => d.name === district);
      if (!selected) return;
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/d/${selected.code}?depth=2`);
        setWards(res.data.wards);
        setWard('');
      } catch (err) {
        console.error('Lỗi load phường/xã:', err);
      }
    };
    fetchWards();
  }, [district, districts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!name || !province || !district || !ward || !addressDetail || !phone) {
      setError('Vui lòng điền đầy đủ thông tin'); return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Số điện thoại phải gồm đúng 10 chữ số'); return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/shops',
        { name, province, district, ward, address_detail: addressDetail, phone, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Thêm cửa hàng thành công!');
      setTimeout(() => {
        navigate('/AdminHome/Shop/list');
      }, 1000);
    } catch (err) {
      console.error('Thêm shop thất bại:', err.response?.data || err.message);
      setError('Lỗi khi thêm cửa hàng');
    }
    setLoading(false);
  };

  return (
    <div className="w-full text-sm">
      <div className="mx-5 my-5 p-6 bg-white rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-blue-800 text-white text-left">
                <th className="px-2 py-1">Tên cửa hàng</th>
                <th className="px-2 py-1">Tỉnh / TP</th>
                <th className="px-2 py-1">Quận / Huyện</th>
                <th className="px-2 py-1">Phường / Xã</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-1 py-1">
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="Tên cửa hàng" className="w-full px-2 py-2 border rounded-md" />
                </td>
                <td className="px-1 py-1">
                  <select value={province} onChange={e => setProvince(e.target.value)}
                    className="w-full px-2 py-2 border rounded-md">
                    <option value="">Chọn tỉnh / TP</option>
                    {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                  </select>
                </td>
                <td className="px-1 py-1">
                  <select value={district} onChange={e => setDistrict(e.target.value)} disabled={!province}
                    className="w-full px-2 py-2 border rounded-md">
                    <option value="">Chọn quận / huyện</option>
                    {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                  </select>
                </td>
                <td className="px-1 py-1">
                  <select value={ward} onChange={e => setWard(e.target.value)} disabled={!district}
                    className="w-full px-2 py-2 border rounded-md">
                    <option value="">Chọn phường / xã</option>
                    {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
            <thead>
              <tr className="bg-blue-800 text-white text-left">
                <th className="px-2 py-1">Địa chỉ chi tiết</th>
                <th className="px-2 py-1">Số điện thoại</th>
                <th className="px-2 py-1">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-1 py-1">
                  <input value={addressDetail} onChange={e => setAddressDetail(e.target.value)}
                    placeholder="Số nhà, đường..." className="w-full px-2 py-2 border rounded-md" />
                </td>
                <td className="px-1 py-1">
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="Số điện thoại" className="w-full px-2 py-2 border rounded-md" />
                </td>
                <td className="px-1 py-1">
                  <select value={status} onChange={e => setStatus(e.target.value)}
                    className="w-full px-2 py-2 border rounded-md">
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between mt-3">
            <button 
              onClick={() => navigate('/AdminHome/Shop/list')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
            >
              Quay lại
            </button>
            <button type="submit" disabled={loading}
              className={`bg-blue-800 text-white py-2 px-6 rounded-lg ${loading ? 'opacity-50' : ''}`}>
              {loading ? 'Đang thêm...' : '+ Thêm cửa hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ShopAdd;