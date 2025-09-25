import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Debug: Kiểm tra xem root element có tồn tại không
const rootElement = document.getElementById('root');
console.log('🔍 Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">❌ Root element not found!</div>';
} else {
  console.log('✅ Root element found, rendering App...');
  
  try {
    createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering App:', error);
    rootElement.innerHTML = '<div style="padding: 20px; color: red;">❌ Error rendering App: ' + error + '</div>';
  }
}
