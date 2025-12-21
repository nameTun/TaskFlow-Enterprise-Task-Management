import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme, TOGGLE_THEME } from '../../context/theme/ThemeContext';
import { Layout, Menu, Button, Grid } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { useBreakpoint } = Grid;

const AppHeader = () => {
  const { state, dispatch } = useTheme();
  const screens = useBreakpoint();
  const location = useLocation();

  const handleThemeToggle = () => {
    dispatch({ type: TOGGLE_THEME });
  };

  const menuItems = [
    { key: '/login', label: <Link to="/login">Login</Link> },
    { key: '/register', label: <Link to="/register">Register</Link> },
  ];

  return (
    <AntHeader style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
      <div style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: state.isDarkMode ? '#fdc700' : '#9f0712',
      }}>
        <Link to="/" style={{ color: 'inherit' }}>ToDo App</Link>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Menu
          theme={state.isDarkMode ? 'dark' : 'light'}
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderBottom: 'none', minWidth: 0, flex: 'auto', justifyContent: 'flex-end' }}
          overflowedIndicator={!screens.md}
        />

        <Button
          onClick={handleThemeToggle}
          icon={state.isDarkMode ? <SunOutlined /> : <MoonOutlined />}
          shape="circle"
          style={{ marginLeft: '16px' }}
          aria-label="Toggle theme"
        />
      </div>
    </AntHeader>
  );
};

export default AppHeader;
