import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import NBAGame from './games/NBAGame';
import NFLGame from './games/NFLGame';
import ComingSoon from './components/ComingSoon';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nba" element={<NBAGame />} />
        <Route path="/nfl" element={<NFLGame />} />
        <Route path="/soccer" element={<ComingSoon sport="Soccer" />} />
        <Route path="/ufc" element={<ComingSoon sport="UFC" />} />
        <Route path="/f1" element={<ComingSoon sport="F1" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;