import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/tailwind.css';
import App from './App';
import LoadingScreen from './components/LoadingScreen';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('No root element found');
} else {
  const root = ReactDOM.createRoot(rootElement);
  
  const AppWithLoading = () => {
    const [loading, setLoading] = useState(true);

    if (loading) {
      return <LoadingScreen onLoadComplete={() => setLoading(false)} />;
    }

    return (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  };

  root.render(<AppWithLoading />);
}
