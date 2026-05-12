import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { Toaster } from 'sonner'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111118',
            border: '1px solid #27272a',
            color: '#fff',
          },
        }}
      />
    </ThemeProvider>
  </React.StrictMode>,
)
