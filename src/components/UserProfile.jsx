import React from 'react';
import { useAuth } from '../context/AuthContext'; // <-- SỬ DỤNG CUSTOM HOOK

const UserProfile = () => {
    // Lấy user và hàm logout từ context
    const { user, logout } = useAuth(); 

    // Vì App.jsx đã kiểm tra, nên chúng ta chắc chắn user không null ở đây
    const profile = user.profile;

    return (
        <div>
            <h2>Chào mừng, {profile.tenNhanVien}!</h2>
            <p><strong>Mã nhân viên:</strong> {profile.maNV}</p>
            <p><strong>Tài khoản:</strong> {profile.username}</p>
            
            {/* Nút đăng xuất chỉ cần gọi hàm logout từ context */}
            <button onClick={logout}>Đăng xuất</button>
        </div>
    );
};

export default UserProfile;