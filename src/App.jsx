import React from 'react';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import './App.css';
import { useAuth } from './context/AuthContext'; // <-- SỬ DỤNG CUSTOM HOOK
function App() {
  // Lấy token từ localStorage
  const { user } = useAuth(); // <-- Lấy trạng thái user từ context

  return (
    <div className="App">      
      {user ? <UserProfile /> : <LoginPage />}
    </div>
  );
}

export default App;