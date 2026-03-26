import { useState } from 'react';
import PlusMinusSection from './components/PlusMinusSection';
import BinarySection from './components/BinarySection';
import './App.css';

const TABS = [
  { id: 'pm', label: '±1 Vectors' },
  { id: 'binary', label: '0-1 Vectors' },
];

function App() {
  const [activeTab, setActiveTab] = useState('pm');

  return (
    <div className="app-root">
      <header className="app-header">
        <h1 className="app-title">Balancing Sets of Vectors</h1>
        <p className="app-subtitle">
          Computational demonstration of optimal balancing-set bounds for ±1 and
          0-1 vector families.
        </p>
        <nav className="tab-nav" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              className={`tab-btn ${activeTab === t.id ? 'tab-btn--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'pm' && <PlusMinusSection />}
        {activeTab === 'binary' && <BinarySection />}
      </main>

      <footer className="app-footer">
        <p>
          AOA Project — Balancing Sets · Knuth&apos;s Construction &amp; Greedy
          Heuristic
        </p>
      </footer>
    </div>
  );
}

export default App;
