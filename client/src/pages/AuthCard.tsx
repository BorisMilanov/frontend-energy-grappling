import React from 'react';
import { Card, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router';

const { Title, Text } = Typography;

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/** Shared shell for the login / register screens. */
const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => (
  <div
    style={{
      minHeight: '100vh',
      background: '#001529',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}
  >
    <Card style={{ width: '100%', maxWidth: 420, borderRadius: 12 }}>
      <Link to="/" style={{ fontSize: 13 }}>
        <ArrowLeftOutlined /> Към сайта
      </Link>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          {title}
        </Title>
        <Text type="secondary">{subtitle}</Text>
      </div>
      {children}
    </Card>
  </div>
);

export default AuthCard;
