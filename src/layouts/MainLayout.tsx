import React from 'react';
import { Layout, theme } from 'antd';
import { Outlet } from 'react-router';
import AppHeader from '../components/AppHeader';

const { Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    // Changed to 100vh to ensure the background covers the whole screen
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader scrollToSection={() => {}} />
      
      <Content style={{ 
        marginTop: 64, // Matches Header height
        padding: '16px', // Slightly smaller padding for mobile feel
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div
          style={{
            background: colorBgContainer,
            /* 
               IMPORTANT: CSS calc() MUST have spaces around the minus sign.
               100vh (viewport) - 64px (header) - 70px (footer estimate) 
            */
            minHeight: 'calc(100vh - 150px)', 
            padding: 24,
            borderRadius: borderRadiusLG,
            flex: 1 // Ensures this div grows to fill available space
          }}
        >
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', padding: '20px 0' }}>
        Team Grapling ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default MainLayout;