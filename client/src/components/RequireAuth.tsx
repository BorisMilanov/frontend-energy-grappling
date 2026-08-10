import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { Navigate, useLocation } from 'react-router';

import { authApi, clearSession, getToken } from '../services/authApi';

type Status = 'checking' | 'authenticated' | 'anonymous';

/** Gate for routes that need a valid (not merely present) token. */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [status, setStatus] = useState<Status>(() => (getToken() ? 'checking' : 'anonymous'));

  useEffect(() => {
    if (status !== 'checking') return;

    let active = true;
    authApi
      .me()
      .then(() => active && setStatus('authenticated'))
      .catch(() => {
        // Expired or tampered token — drop it so the user gets a clean login.
        clearSession();
        if (active) setStatus('anonymous');
      });

    return () => {
      active = false;
    };
  }, [status]);

  if (status === 'checking') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default RequireAuth;
