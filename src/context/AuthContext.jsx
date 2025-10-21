import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig'; // Import axios instance của bạn

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider Component (Nhà cung cấp)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Sẽ chứa thông tin user {token, profile}
    const [loading, setLoading] = useState(true); // Trạng thái chờ khi app khởi động

    // Hàm này chạy 1 LẦN DUY NHẤT khi app khởi động
    // để kiểm tra xem người dùng đã đăng nhập từ trước chưa
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Nếu có token, gọi API để lấy thông tin user
            api.get('/NhanVien/profile')
                .then(response => {
                    // Lưu thông tin user vào state
                    setUser({ token: token, profile: response.data });
                })
                .catch(() => {
                    // Nếu token không hợp lệ (hết hạn, sai...), xóa nó đi
                    localStorage.removeItem('authToken');
                })
                .finally(() => {
                    // Báo cho app biết đã kiểm tra xong
                    setLoading(false);
                });
        } else {
            // Không có token, không cần làm gì
            setLoading(false);
        }
    }, []); // Mảng rỗng [] đảm bảo nó chỉ chạy 1 lần

    // Hàm để đăng nhập
    const login = async (username, password) => {
        // Gọi API đăng nhập
        const response = await api.post('/auth/login', { username, password });
        const token = response.data.token;

        // Lưu token
        localStorage.setItem('authToken', token);

        // Lấy thông tin profile
        const profileResponse = await api.get('/NhanVien/profile');

        // Cập nhật state, làm cho toàn bộ app "biết" là đã đăng nhập
        setUser({ token: token, profile: profileResponse.data });
    };

    // Hàm để đăng xuất
    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null); // Cập nhật state, làm app "biết" là đã đăng xuất
    };

    // Đây là những thứ mà Provider sẽ "chia sẻ" cho các component con
    const value = {
        user,       // Thông tin người dùng (hoặc null)
        loading,    // Trạng thái (true/false)
        login,      // Hàm đăng nhập
        logout,     // Hàm đăng xuất
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Chỉ render các con khi không còn loading */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 3. Tạo một custom hook (lối tắt) để dễ sử dụng
export const useAuth = () => {
    return useContext(AuthContext);
};