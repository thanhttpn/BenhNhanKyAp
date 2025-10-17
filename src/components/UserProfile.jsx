import React from 'react';
import { useAuth } from '../context/AuthContext'; // <-- SỬ DỤNG CUSTOM HOOK

const UserProfile = () => {
    const { user, logout } = useAuth(); // <-- LẤY USER VÀ HÀM LOGOUT

    // Component này giờ chỉ được render khi đã có user, nên không cần check null nhiều
    const profile = user.profile;

    return (
        <div>
            <h2>Thông tin cá nhân</h2>
            <p><strong>Mã nhân viên:</strong> {profile.maNV}</p>
            <p><strong>Tên nhân viên:</strong> {profile.tenNhanVien}</p>
            <p><strong>Tài khoản:</strong> {profile.username}</p>
            <button onClick={logout}>Đăng xuất</button> {/* <-- NÚT ĐĂNG XUẤT */}
        </div>
    );
};

export default UserProfile;