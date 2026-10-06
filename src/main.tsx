import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { GameCatalogProvider } from './context/GameCatalogContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameCatalogProvider>
      <App />
    </GameCatalogProvider>
  </React.StrictMode>,
);
