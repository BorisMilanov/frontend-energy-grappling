import React, { useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router';

import AuthCard from './AuthCard';
import { authApi, setSession, type LoginPayload } from '../services/authApi';
import { ROUTES } from '../routes';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Where RequireAuth bounced us from, if anywhere.
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.chat;

  const onFinish = async (values: LoginPayload): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(values);
      setSession(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при вход.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Вход" subtitle="Влез в профила си">
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      <Form layout="vertical" onFinish={onFinish} requiredMark={false} disabled={loading}>
        <Form.Item
          name="email"
          label="Имейл"
          rules={[
            { required: true, message: 'Въведи имейл.' },
            { type: 'email', message: 'Невалиден имейл.' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="ivan@example.com" autoComplete="email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Парола"
          rules={[{ required: true, message: 'Въведи парола.' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Влез
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        Нямаш профил? <Link to={ROUTES.register}>Регистрация</Link>
      </div>
    </AuthCard>
  );
};

export default LoginPage;
