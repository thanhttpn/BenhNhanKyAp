import React from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';
import { CssBaseline } from '@mui/material'; // <-- IMPORT
function App() {
  const { user } = useAuth(); // <-- Lấy trạng thái user từ context

  return (
    <div className="App">     
      <CssBaseline />
      {user ? <Dashboard /> : <LoginPage />}
    </div>
  );
}

export default App;