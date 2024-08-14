import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import SetupStage1 from './setup/stage1/page';

function Function() {
  return (
    <main className="relative flex flex-col items-center justify-center h-screen bg-[#0e0e0e]">
      <h1 className="text-4xl font-bold text-white">Hello, World!</h1>
    </main>
  );
}

export default function App() {
  useEffect(() => {
    window.electron.ipcRenderer.once('settings:get', (arg) => {
      const settings = arg;
      if (settings && !(settings as any).setupDone) {
        if (typeof window !== 'undefined') {
          if ((settings as any).setupPart === 0)
            window.location.href = '/setup/stage1';
          if ((settings as any).setupPart === 1)
            window.location.href = '/setup/stage2';
        }
      }
    });
    window.electron.ipcRenderer.sendMessage('settings:get');
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Function />} />
        <Route path="/setup/stage1" element={<SetupStage1 />} />
      </Routes>
    </Router>
  );
}
