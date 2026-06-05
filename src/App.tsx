import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';

import BJJHomePage from './pages/BJJHomePage';
import ScheduleTable from './pages/ScheduleTable';

import CalendarPage from './pages/CalendarPage';

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
        <Route
         
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
