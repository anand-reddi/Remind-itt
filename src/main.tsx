import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeKeyboard, addKeyboardCSS } from './lib/KeyboardManager'
import { Capacitor } from '@capacitor/core'

// Initialize keyboard handling
document.addEventListener('DOMContentLoaded', () => {
  // Initialize keyboard handling for mobile
  initializeKeyboard();
  addKeyboardCSS();
});

createRoot(document.getElementById("root")!).render(<App />);
