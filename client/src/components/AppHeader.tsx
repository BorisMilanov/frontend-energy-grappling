import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { MenuOutlined, CloseOutlined, LoginOutlined, UserAddOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router';

import { clearSession, getUser } from '../services/authApi';

const { Header } = Layout;

// Define your clean structure array
const baseItems = [
  { key: '/', label: 'Начало' },
  { key: '/graphic', label: 'ScheduleTable' },
  { key: '/price', label: 'Price' },
  { key: '/about', label: 'Контакти' },
];

const LOGOUT_KEY = 'logout';

// Keys that are real pages; everything else is a section to scroll to on the home page.
const ROUTE_KEYS = new Set(['/chat', '/login', '/register']);

interface CustomHeaderProps {
  scrollToSection: (id: string) => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ scrollToSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Read on every render so the bar flips right after login / logout.
  const user = getUser();

  const menuItems: MenuProps['items'] = user
    ? [
        ...baseItems,
        { key: '/chat', label: 'Чат' },
        { key: LOGOUT_KEY, label: `Изход (${user.full_name})`, icon: <LogoutOutlined /> },
      ]
    : [
        ...baseItems,
        { key: '/login', label: 'Вход', icon: <LoginOutlined /> },
        { key: '/register', label: 'Регистрация', icon: <UserAddOutlined /> },
      ];

  // Highlight the current page; on the home page the scroll links all fall back to "Начало".
  const selectedKeys = [ROUTE_KEYS.has(location.pathname) ? location.pathname : '/'];

  // Ant Design Menu onClick handler signature
  const handleMenuClick: MenuProps['onClick'] = (info) => {
    const path = info.key; // e.g., '/graphic' or '/'

    if (path === LOGOUT_KEY) {
      clearSession();
      navigate('/login');
    } else if (ROUTE_KEYS.has(path)) {
      navigate(path);
    } else if (path === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Remove the leading slash to match your section ID (e.g., 'graphic')
      const sectionId = path.replace('/', '');
      scrollToSection(sectionId);
    }

    // Close mobile dropdown menu if it's open
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <Header
        style={{
          position: 'fixed',
          zIndex: 1000,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 50px',
          background: '#001529',
          height: '64px',
        }}
      >
        {/* Brand Logo */}
        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>
       <img src="/public/logo.png" alt="Logo" />
        </div>

        {/* --- DESKTOP MENU --- */}
        <div className="desktop-menu-wrapper" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={selectedKeys}
            items={menuItems} // Passes your configuration array directly here
            onClick={handleMenuClick} // Intercepts the click events uniformly
            style={{ minWidth: '520px', borderBottom: 'none', justifyContent: 'flex-end' }}
          />
        </div>

        {/* --- MOBILE HAMBURGER ICON --- */}
        <div 
          className="mobile-burger-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ color: 'white', fontSize: '22px', cursor: 'pointer', display: 'none' }}
        >
          {isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
        </div>
      </Header>

      {/* --- MOBILE DROPDOWN --- */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            width: '100%',
            backgroundColor: '#001529',
            zIndex: 999,
            borderTop: '1px solid #002140',
          }}
        >
          <Menu
            theme="dark"
            mode="vertical"
            selectedKeys={selectedKeys}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ borderRight: 'none' }}
          />
        </div>
      )}

      {/* Responsive Breakpoint Handling */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-menu-wrapper {
            display: none !important;
          }
          .mobile-burger-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default CustomHeader;