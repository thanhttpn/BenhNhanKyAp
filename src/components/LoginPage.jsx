import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // <-- IMPORT INSTANCE MỚI CỦA CHÚNG TA

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Gọi API bằng instance đã cấu hình
                // Bạn không cần phải thêm token hay URL đầy đủ nữa
                const response = await api.get('/NhanVien/profile');
                setUserData(response.data);
            } catch (err) {
                console.error('Lỗi khi lấy thông tin người dùng:', err);
                if (err.response && err.response.status === 401) {
                     setError('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
                } else {
                     setError('Không thể tải dữ liệu người dùng.');
                }
            }
        };

        fetchProfile();
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!userData) {
        return <p>Đang tải thông tin...</p>;
    }

    return (
        <div>
            <h2>Thông tin cá nhân</h2>
            <p><strong>Mã nhân viên:</strong> {userData.maNV}</p>
            <p><strong>Tên nhân viên:</strong> {userData.tenNhanVien}</p>
            <p><strong>Tài khoản:</strong> {userData.username}</p>
        </div>
    );
};

export default UserProfile;