import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Customers from './pages/Customers/Customers';
import Suppliers from './pages/Suppliers/Suppliers';
import PlaceholderPage from './pages/PlaceholderPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Dashboard */}
          <Route path="/"           element={<PlaceholderPage title="Dashboard"  icon="📊" />} />

          {/* Core modules */}
          <Route path="/customers"  element={<Customers />} />
          <Route path="/suppliers"  element={<Suppliers />} />

          {/* Placeholder routes — future teams */}
          <Route path="/purchases"  element={<PlaceholderPage title="Purchases"  icon="🛒" />} />
          <Route path="/sales"      element={<PlaceholderPage title="Sales"      icon="🧾" />} />
          <Route path="/inventory"  element={<PlaceholderPage title="Inventory"  icon="📦" />} />
          <Route path="/reports"    element={<PlaceholderPage title="Reports"    icon="📈" />} />
          <Route path="/settings"   element={<PlaceholderPage title="Settings"   icon="⚙️" />} />

          {/* 404 */}
          <Route path="*"           element={<PlaceholderPage title="Page Not Found" icon="🔍" />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
