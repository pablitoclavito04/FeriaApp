import { useState, useEffect } from 'react';
import useAuth from '../context/useAuth';
import api from '../services/api';
import fairService from '../services/fairService';
import casetaService from '../services/casetaService';
import menuService from '../services/menuService';
import concertService from '../services/concertService';

const Dashboard = () => {
  const { user } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ fairs: 0, casetas: 0, menus: 0, concerts: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [fairs, casetas, menus, concerts] = await Promise.all([
          fairService.getFairs(),
          casetaService.getCasetas(),
          menuService.getMenus(),
          concertService.getConcerts(),
        ]);
        setStats({
          fairs: fairs.length,
          casetas: casetas.length,
          menus: menus.length,
          concerts: concerts.length,
        });
      } catch {
        // Stats are non-critical
      }
    };
    loadStats();
  }, []);

  const handlePublish = async () => {
    setPublishing(true);
    setMessage('');
    setError('');

    try {
      await api.post('/publish');
      setMessage('Published successfully! GitHub Pages will update in a few seconds.');
    } catch {
      setError('Error publishing. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.name}</h1>
      <p>Here's an overview of your fair management system.</p>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon fairs">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.fairs}</div>
            <div className="stat-label">Fairs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon casetas">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.casetas}</div>
            <div className="stat-label">Casetas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon menus">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.menus}</div>
            <div className="stat-label">Menu items</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon concerts">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.concerts}</div>
            <div className="stat-label">Concerts</div>
          </div>
        </div>
      </div>

      <div className="publish-section">
        <h2>Publish Website</h2>
        <p>Generate static files and publish the public website to GitHub Pages.</p>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button onClick={handlePublish} disabled={publishing}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {publishing ? 'Publishing...' : 'Publish Website'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
