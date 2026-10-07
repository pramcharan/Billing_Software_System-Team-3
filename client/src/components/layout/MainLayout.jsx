import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar  = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="app-main">
        <Header onMenuToggle={openSidebar} />

        <main className="app-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
