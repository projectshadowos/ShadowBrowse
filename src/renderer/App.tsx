import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import SetupStage1 from './setup/stage1/page';

function Function() {
  return (
    <div>
      <h1>Function</h1>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Function />} />
        <Route path="/setup/stage1" element={<SetupStage1 />} />
      </Routes>
    </Router>
  );
}
