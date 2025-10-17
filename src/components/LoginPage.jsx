import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); // Ngăn form submit và tải lại trang
        setError(''); // Xóa lỗi cũ

        try {
            const response = await axios.post('https://localhost:7229/api/auth/login', {
                username: username,
                password: password
            });
            
            // Lấy token từ response
            const token = response.data.token;
            console.log('Đăng nhập thành công, nhận được token:', token);

            // Lưu token vào localStorage để sử dụng cho các request sau
            localStorage.setItem('authToken', token);

            // Chuyển hướng đến trang chính hoặc làm gì đó sau khi đăng nhập thành công
            alert('Đăng nhập thành công!');

        } catch (err) {
            console.error('Lỗi đăng nhập:', err.response);
            setError('Tài khoản hoặc mật khẩu không chính xác.');
            alert('Đăng nhập thất bại!');
        }
    };

    return (
        <div>
            <h2>Đăng nhập hệ thống</h2>
            <form onSubmit={handleLogin}>
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