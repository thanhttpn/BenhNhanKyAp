import React from 'react';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
  // Lấy token từ localStorage
  const token = localStorage.getItem('authToken');

  return (
    <div className="App">
      {token ? <UserProfile /> : <LoginPage />}
    </div>
  );
}

export default App;