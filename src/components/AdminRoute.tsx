import React from 'react';
import { Navigate } from 'react-router';
import { authStorage } from '../services/authApi';

interface Props {
  children: React.ReactNode;
}

const AdminRoute: React.FC<Props> = ({ children }) => {
  if (!authStorage.isLoggedIn()) return <Navigate to="/login" replace />;
  if (!authStorage.isAdmin()) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default AdminRoute;
