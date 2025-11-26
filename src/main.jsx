import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx'; // <-- IMPORT

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Bao bọc <App /> bằng <AuthProvider /> */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)