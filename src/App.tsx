import React from 'react';
import { WorkerSuperScreen } from './components/worker/WorkerSuperScreen';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <>
      <WorkerSuperScreen />
      <Toaster />
    </>
  );
}

export default App;