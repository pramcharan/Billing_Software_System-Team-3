import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, User } from 'lucide-react';

const ROUTE_META = {
  '/':           { title: 'Dashboard' },
  '/customers':  { title: 'Customer Management' },
  '/suppliers':  { title: 'Supplier Management' },
  '/purchases':  { title: 'Purchases' },
  '/sales':      { title: 'Sales' },
  '/inventory':  { title: 'Inventory' },
  '/reports':    { title: 'Reports' },
  '/settings':   { title: 'Settings' },
};

const Header = ({ onMenuToggle }) => {
  const location = useLocation();

  const matchedKey =
    Object.keys(ROUTE_META)
      .filter(k => k !== '/')
      .find(k => location.pathname.startsWith(k)) ||
    (location.pathname === '/' ? '/' : null);

  const meta = ROUTE_META[matchedKey] || { title: 'Billing Software' };

  return (
    <header className="top-header" role="banner">
      {/* Left — mobile hamburger */}
      <button
        className="top-header__menu-btn"
        onClick={onMenuToggle}
        aria-label="Toggle navigation menu"
      >
        <Menu size={21} />
      </button>

      {/* Page title */}
      <h1 className="top-header__title">{meta.title}</h1>

      {/* Right — search icon + admin badge */}
      <div className="top-header__right">
        <div className="top-header__admin" aria-label="Logged in as Admin">
          <div className="top-header__avatar">
            <User size={15} />
          </div>
          <span className="top-header__admin-label">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
