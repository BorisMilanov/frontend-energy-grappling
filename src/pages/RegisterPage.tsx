import React, { useState } from 'react';
import { ConfigProvider, Form, Input, Button, Typography, Alert, Layout } from 'antd';
import { useNavigate, Link } from 'react-router';
import { authApi } from '../services/authApi';

const { Title, Text } = Typography;
const { Content } = Layout;

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onFinish = async (values: RegisterForm) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.register(values.email, values.password, values.firstName, values.lastName);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Грешка при регистрация.');
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
            maxWidth: 440,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={3} style={{ margin: 0 }}>
                Energy Grappling
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>Създай профил</Text>
            </div>

            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
            {success && (
              <Alert
                message="Регистрацията е успешна! Пренасочване..."
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item label="Собствено име" name="firstName" rules={[{ required: true, message: 'Въведи собствено ime.' }]}>
                <Input size="large" placeholder="Иван" />
              </Form.Item>

              <Form.Item label="Фамилия" name="lastName" rules={[{ required: true, message: 'Въведи фамилия.' }]}>
                <Input size="large" placeholder="Иванов" />
              </Form.Item>

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
                rules={[{ required: true, min: 6, message: 'Паролата трябва да е поне 6 символа.' }]}
              >
                <Input.Password size="large" placeholder="••••••••" />
              </Form.Item>

              <Form.Item
                label="Потвърди парола"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Потвърди паролата.' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('Паролите не съвпадат.'));
                    },
                  }),
                ]}
              >
                <Input.Password size="large" placeholder="••••••••" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  disabled={success}
                  block
                  style={{ height: 48 }}
                >
                  Регистрирай се
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Text type="secondary">Вече имаш профил? </Text>
              <Link to="/login">Влез</Link>
            </div>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default RegisterPage;
