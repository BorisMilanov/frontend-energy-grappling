import React, { useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';

import AuthCard from './AuthCard';
import { authApi, setSession, type RegisterPayload } from '../services/authApi';
import { ROUTES } from '../routes';

interface RegisterFormValues extends RegisterPayload {
  confirm: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: RegisterFormValues): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.register({
        email: values.email,
        full_name: values.full_name,
        password: values.password,
      });
      setSession(data);
      navigate(ROUTES.home, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при регистрация.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Регистрация" subtitle="Създай профил в Energy Grappling">
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      <Form layout="vertical" onFinish={onFinish} requiredMark={false} disabled={loading}>
        <Form.Item
          name="full_name"
          label="Име"
          rules={[{ required: true, min: 2, message: 'Въведи име (поне 2 символа).' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Иван Иванов" autoComplete="name" />
        </Form.Item>

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
          rules={[{ required: true, min: 8, message: 'Паролата трябва да е поне 8 символа.' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Повтори паролата"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Повтори паролата.' },
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                !value || getFieldValue('password') === value
                  ? Promise.resolve()
                  : Promise.reject(new Error('Паролите не съвпадат.')),
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Регистрирай се
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        Вече имаш профил? <Link to={ROUTES.login}>Вход</Link>
      </div>
    </AuthCard>
  );
};

export default RegisterPage;
