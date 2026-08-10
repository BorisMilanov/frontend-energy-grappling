import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';

import BJJHomePage from './pages/BJJHomePage';
import ScheduleTable from './pages/ScheduleTable';

import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import RequireAuth from './components/RequireAuth';

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
 
        <Route path="/calendar" element={<CalendarPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/chat"
          element={
            <RequireAuth>
              <ChatPage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
