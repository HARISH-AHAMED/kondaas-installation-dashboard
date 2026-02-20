import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TVHome from './pages/TVHome';
import TVDashboard from './pages/TVDashboard';
import './App.css';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TVDashboard />} />
        <Route path="/search" element={<TVHome />} />
      </Routes>
    </Router>
  );
}

export default App;
