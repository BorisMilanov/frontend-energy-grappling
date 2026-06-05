import React, { useState } from 'react';
import { ConfigProvider, Form, Input, Button, Typography, Alert, Layout } from 'antd';
import { useNavigate, Link } from 'react-router';
import { authApi, authStorage } from '../services/authApi';

const { Title, Text } = Typography;
const { Content } = Layout;

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(values.email, values.password);
      authStorage.save(data);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Грешка при влизане.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1890ff', borderRadius: 8 } }}>
      <Layout style={{ minHeight: '100vh', background: '#001529' }}>
        <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '48px 40px',
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={3} style={{ margin: 0 }}>
                Energy Grappling
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>Влез в профила си</Text>
            </div>

            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item
                label="Имейл"
                name="email"
                rules={[{ required: true, type: 'email', message: 'Въведи валиден имейл.' }]}
              >
                <Input size="large" placeholder="ivan@example.com" />
              </Form.Item>

              <Form.Item
                label="Парола"
                name="password"
                rules={[{ required: true, message: 'Въведи парола.' }]}
              >
                <Input.Password size="large" placeholder="••••••••" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  style={{ height: 48 }}
                >
                  Влез
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Text type="secondary">Нямаш профил? </Text>
              <Link to="/register">Регистрирай се</Link>
            </div>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default LoginPage;
