import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';

import BJJHomePage from './pages/BJJHomePage';
import ScheduleTable from './pages/ScheduleTable';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CalendarPage from './pages/CalendarPage';
import AdminCalendarPage from './pages/AdminCalendarPage';
import AdminMembersPage from './pages/AdminMembersPage';
import MembersPage from './pages/MembersPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const Price: React.FC = () => <h2 style={{ padding: 40 }}>Pricing Table</h2>;
const About: React.FC = () => <h2 style={{ padding: 40 }}>About the Team</h2>;

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BJJHomePage />} />
        <Route path="/graphic" element={<ScheduleTable />} />
        <Route path="/price" element={<Price />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/calendar" element={<CalendarPage />} />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <MembersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/calendar"
          element={
            <AdminRoute>
              <AdminCalendarPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <AdminRoute>
              <AdminMembersPage />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
