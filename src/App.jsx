import React from 'react';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile'; // Giả sử bạn có component này
// import SignaturePage from './components/SignaturePage'; // Hoặc trang ký tên
import { useAuth } from './context/AuthContext'; // <-- SỬ DỤNG CUSTOM HOOK
import './App.css';

function App() {
  const { user } = useAuth(); // <-- Lấy trạng thái user từ context

  return (
    <div className="App">
      {/* Toán tử 3 ngôi:
        Nếu CÓ user -> Hiển thị trang UserProfile (hoặc trang chính của app)
        Nếu KHÔNG CÓ user -> Hiển thị trang LoginPage
      */}
      {user ? <UserProfile /> : <LoginPage />}
    </div>
  );
}

export default App;