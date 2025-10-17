import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // <-- SỬ DỤNG CUSTOM HOOK

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth(); // <-- LẤY HÀM LOGIN TỪ CONTEXT

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Chỉ cần gọi hàm login, mọi logic còn lại đã nằm trong context
            await login(username, password);
            // Không cần chuyển hướng, App component sẽ tự động làm điều đó
        } catch {
            setError('Tài khoản hoặc mật khẩu không chính xác.');
        }
    };

    return (
        <div>
            <h2>Đăng nhập hệ thống</h2>
            <form onSubmit={handleLogin}>
                {/* ... phần input username/password giữ nguyên ... */}
                <div>
                    <label>Tài khoản:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Mật khẩu:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Đăng nhập</button>
            </form>
        </div>
    );
};

export default LoginPage;