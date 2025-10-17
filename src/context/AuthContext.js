import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // Import axios instance của bạn

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Sẽ chứa thông tin user {token, profile}
    const [loading, setLoading] = useState(true); // Để xử lý lần tải đầu tiên

    // useEffect để kiểm tra token khi app khởi động
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Nếu có token, gọi API để lấy thông tin user
            api.get('/NhanVien/profile')
                .then(response => {
                    setUser({ token: token, profile: response.data });
                })
                .catch(() => {
                    // Nếu token không hợp lệ, xóa nó đi
                    localStorage.removeItem('authToken');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    // Hàm để đăng nhập
    const login = async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        // Sau khi có token, gọi API lấy profile
        const profileResponse = await api.get('/NhanVien/profile');
        setUser({ token: token, profile: profileResponse.data });
    };

    // Hàm để đăng xuất
    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
    };

    // Giá trị mà Provider sẽ cung cấp cho các component con
    const value = {
        user,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. (Tùy chọn nhưng rất hữu ích) Tạo một custom hook để dễ sử dụng
export const useAuth = () => {
    return React.useContext(AuthContext);
};