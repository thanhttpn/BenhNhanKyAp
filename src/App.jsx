import React from 'react';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import { useAuth } from './context/AuthContext'; // <-- SỬ DỤNG CUSTOM HOOK
import './App.css';

function App() {
  const { user, loading } = useAuth(); // <-- LẤY TRẠNG THÁI TỪ CONTEXT

  // Hiển thị màn hình loading trong lúc context đang kiểm tra token
  if (loading) {
    return <div>Đang tải ứng dụng...</div>;
  }

  return (
    <div className="App">
      {user ? <UserProfile /> : <LoginPage />}
    </div>
  );
}

export default App;