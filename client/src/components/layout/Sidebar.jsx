import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Truck,
  ShoppingCart,
  Receipt,
  Boxes,
  ChartNoAxesCombined,
  Settings,
  X,
  Receipt as BillingIcon
} from 'lucide-react';

/* ─── Exact nav items required — NO Products, Categories, or Logout ─── */
const MAIN_NAV = [
  { label: 'Dashboard',        icon: LayoutDashboard,     path: '/' },
  { label: 'Customers',        icon: Users,               path: '/customers' },
  { label: 'Suppliers',        icon: Truck,               path: '/suppliers' },
  { label: 'Purchases',        icon: ShoppingCart,        path: '/purchases' },
  { label: 'Sales',            icon: Receipt,             path: '/sales' },
  { label: 'Inventory',        icon: Boxes,               path: '/inventory' },
  { label: 'Reports',          icon: ChartNoAxesCombined, path: '/reports' },
];

const BOTTOM_NAV = [
  { label: 'Settings',         icon: Settings,            path: '/settings' },
];

const NavItem = ({ label, icon: Icon, path, onClose }) => {
  const location = useLocation();
  const active = path === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(path);

  return (
    <li>
      <NavLink
        to={path}
        end={path === '/'}
        className={`sb-nav-item ${active ? 'sb-nav-item--active' : ''}`}
        onClick={onClose}
        title={label}
      >
        <Icon size={19} className="sb-nav-icon" aria-hidden="true" />
        <span className="sb-nav-label">{label}</span>
      </NavLink>
    </li>
  );
};

const Sidebar = ({ isOpen, onClose }) => (
  <>
    {/* Dim overlay on mobile when sidebar is open */}
    {isOpen && (
      <div
        className="sb-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
    )}

    <aside
      className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* ── Brand header ── */}
      <div className="sb-brand">
        <div className="sb-brand-icon" aria-hidden="true">
          <BillingIcon size={18} />
        </div>
        <span className="sb-brand-name">Billing Software</span>

        {/* Mobile close button */}
        <button
          className="sb-close-btn"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <X size={17} />
        </button>
      </div>

      {/* ── Separator ── */}
      <div className="sb-sep" aria-hidden="true" />

      {/* ── Main navigation ── */}
      <nav className="sb-nav sb-nav--main" aria-label="Main">
        <ul className="sb-nav-list">
          {MAIN_NAV.map(item => (
            <NavItem key={item.path} {...item} onClose={onClose} />
          ))}
        </ul>
      </nav>

      {/* ── Spacer pushes Settings to bottom ── */}
      <div className="sb-spacer" />

      {/* ── Bottom: Settings only ── */}
      <nav className="sb-nav sb-nav--bottom" aria-label="Secondary">
        <ul className="sb-nav-list">
          {BOTTOM_NAV.map(item => (
            <NavItem key={item.path} {...item} onClose={onClose} />
          ))}
        </ul>
      </nav>
    </aside>
  </>
);

export default Sidebar;
