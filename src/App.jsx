import React, { useState } from 'react';
import './App.css';
import CompanyList from './components/CompanyList/CompanyList';
import PreparationPlan from './components/PreparationPlan/PreparationPlan';
import MockInterviews from './components/MockInterviews/MockInterviews';

function App() {
  const [activeModule, setActiveModule] = useState('companies'); // 'companies' or 'preparation'

  return (
    <div className="App">
      <header className="App-header">
        <h1>Connect & Conquer Placements</h1>
        <nav className="module-nav">
          <button onClick={() => setActiveModule('companies')}
                  style={{ backgroundColor: activeModule === 'companies' ? '#007bff' : '#3498db' }}>
            Company Drives
          </button>
          <button onClick={() => setActiveModule('preparation')}
                  style={{ backgroundColor: activeModule === 'preparation' ? '#007bff' : '#3498db' }}>
            Personalized Prep
          </button>
          <button onClick={() => setActiveModule('mockInterviews')}
                  style={{ backgroundColor: activeModule === 'mock_interviews' ? '#007bff' : '#3498db' }}>
            Mock Interviews
          </button>
        </nav>
      </header>
      <main>
        {activeModule === 'companies' && <CompanyList />}
        {activeModule === 'preparation' && <PreparationPlan />}
        {activeModule === 'mockInterviews' && <MockInterviews />}
      </main>
    </div>
  );
}

export default App;