import React from 'react';
import { Layout as AntLayout } from 'antd';
import AppHeader from './Header'; // Renamed to avoid conflict with Ant Design's Layout.Header

const { Content } = AntLayout;

const Layout = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ padding: '0 24px', marginTop: 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {children}
        </div>
      </Content>
    </AntLayout>
  );
};

export default Layout;

