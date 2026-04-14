import { useState } from 'react';
import useAuth from '../context/useAuth';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      <p>FeriaApp Admin Panel</p>

      <div className="publish-section">
        <h2>Publish Website</h2>
        <p>Generate static files and publish the public website to GitHub Pages.</p>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button onClick={handlePublish} disabled={publishing}>
          {publishing ? 'Publishing...' : 'Publish Website'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;