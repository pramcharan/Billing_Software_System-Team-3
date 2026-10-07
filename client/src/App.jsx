import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Customers from './pages/Customers/Customers';
import Suppliers from './pages/Suppliers/Suppliers';
import Purchases from './pages/Purchases/Purchases';
import PurchaseForm from './pages/Purchases/PurchaseForm';
import PurchaseDetails from './pages/Purchases/PurchaseDetails';
import PurchaseHistory from './pages/Purchases/PurchaseHistory';
import PlaceholderPage from './pages/PlaceholderPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Dashboard */}
          <Route path="/"           element={<PlaceholderPage title="Dashboard"  icon="📊" />} />

          {/* Core modules — Team 3 */}
          <Route path="/customers"  element={<Customers />} />
          <Route path="/suppliers"  element={<Suppliers />} />

          {/* Purchase Management */}
          <Route path="/purchases"              element={<Purchases />} />
          <Route path="/purchases/new"          element={<PurchaseForm />} />
          <Route path="/purchases/history"      element={<PurchaseHistory />} />
          <Route path="/purchases/:id"          element={<PurchaseDetails />} />
          <Route path="/purchases/:id/edit"     element={<PurchaseForm />} />

          {/* Placeholder routes — future teams */}
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
