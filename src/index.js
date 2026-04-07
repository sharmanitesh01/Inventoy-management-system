import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Mount React app into the <div id="root"> in public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
