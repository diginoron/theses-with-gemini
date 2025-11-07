import React from 'react';
import TopicGenerator from './components/TopicGenerator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 md:p-8 font-sans">
      <TopicGenerator />
    </div>
  );
};

export default App;