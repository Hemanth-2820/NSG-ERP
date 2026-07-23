import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CompanyProvider } from './components/common/CompanyContext.jsx'

// Global fetch override to enforce HttpOnly cookie usage
const originalFetch = window.fetch;
window.fetch = async function() {
  let [resource, config] = arguments;
  if (!config) {
    config = {};
  }
  
  // Ensure cookies are sent with every cross-origin/same-origin request
  config.credentials = 'include';
  
  // Prevent browser caching for GET requests (fixes UI not updating without refresh)
  const isGet = !config.method || config.method.toUpperCase() === 'GET';
  if (isGet) {
    // Some browsers/proxies ignore 'no-store' or 'no-cache', so appending a timestamp is safest
    config.cache = 'no-store';
    
    // Only append timestamp if resource is a string
    if (typeof resource === 'string' && !resource.startsWith('data:')) {
      const urlObj = new URL(resource, window.location.origin);
      urlObj.searchParams.set('_t', Date.now());
      resource = urlObj.toString();
    }
  }
  
  // Strip manual Authorization Bearer tokens since we use cookies now
  if (config.headers) {
    const headersObj = new Headers(config.headers);
    if (headersObj.has('Authorization')) {
      headersObj.delete('Authorization');
      config.headers = headersObj;
    }
  }
  
  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CompanyProvider>
      <App />
    </CompanyProvider>
  </StrictMode>,
)
