import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ConfigProvider } from 'antd'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Ant Design's ConfigProvider for global theme customization */}
      <ConfigProvider
        theme={{
          // You can customize Ant Design's theme here
          token: {
            colorPrimary: '#52c41a',
          },
        }}
      >
        <App />
        <Toaster position="top-right" />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
)