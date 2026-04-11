import { useState, useEffect } from 'react';
import concertService from '../services/concertService';
import casetaService from '../services/casetaService';

const Concerts = () => {
  const [concerts, setConcerts] = useState([]);
  const [casetas, setCasetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingConcert, setEditingConcert] = useState(null);
  const [formData, setFormData] = useState({
    artist: '',
    genre: '',
    date: '',
    time: '',
    caseta: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [concertsData, casetasData] = await Promise.all([
        concertService.getConcerts(),
        casetaService.getCasetas(),
      ]);
      setConcerts(concertsData);
      setCasetas(casetasData);
    } catch {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingConcert) {
        await concertService.updateConcert(editingConcert._id, formData);
      } else {
        await concertService.createConcert(formData);
      }
      setShowForm(false);
      setEditingConcert(null);
      resetForm();
      loadData();
    } catch {
      setError('Error saving concert');
    }
  };

  const handleEdit = (concert) => {
    setEditingConcert(concert);
    setFormData({
      artist: concert.artist,
      genre: concert.genre,
      date: concert.date?.split('T')[0],
      time: concert.time,
      caseta: concert.caseta?._id || concert.caseta,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this concert?')) {
      try {
        await concertService.deleteConcert(id);
        loadData();
      } catch {
        setError('Error deleting concert');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      artist: '',
      genre: '',
      date: '',
      time: '',
      caseta: '',
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Concerts</h1>
        <button onClick={() => { resetForm(); setEditingConcert(null); setShowForm(true); }}>
          + New Concert
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <h2>{editingConcert ? 'Edit Concert' : 'New Concert'}</h2>
          <div className="form-group">
            <label>Artist</label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Genre</label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Caseta</label>
            <select
              value={formData.caseta}
              onChange={(e) => setFormData({ ...formData, caseta: e.target.value })}
              required
            >
              <option value="">Select a caseta</option>
              {casetas.map((caseta) => (
                <option key={caseta._id} value={caseta._id}>
                  {caseta.number} - {caseta.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="submit">{editingConcert ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Artist</th>
            <th>Genre</th>
            <th>Date</th>
            <th>Time</th>
            <th>Caseta</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {concerts.map((concert) => (
            <tr key={concert._id}>
              <td>{concert.artist}</td>
              <td>{concert.genre}</td>
              <td>{new Date(concert.date).toLocaleDateString()}</td>
              <td>{concert.time}</td>
              <td>{concert.caseta?.name}</td>
              <td>
                <button onClick={() => handleEdit(concert)}>Edit</button>
                <button onClick={() => handleDelete(concert._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Concerts;