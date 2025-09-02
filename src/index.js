import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AppProvider } from "./contexts/AppContext";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AppProvider>
    <App />
  </AppProvider>
);

// Optional: measure performance in your app
reportWebVitals();
