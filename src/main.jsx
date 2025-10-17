import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.js'; // <-- IMPORT

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* <-- BAO BỌC APP */}
      <App />
    </AuthProvider>
  </StrictMode>,
)
