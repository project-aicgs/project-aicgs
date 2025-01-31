import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AIInterface from './components/AIInterface';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AIInterface />} />
      </Routes>
    </Router>
  );
}

export default App;