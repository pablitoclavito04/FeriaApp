import { useState, useEffect } from 'react';
import concertService from '../services/concertService';
import casetaService from '../services/casetaService';
import useToast from '../context/useToast';

const Concerts = () => {
  const { showToast } = useToast();
  const [concerts, setConcerts] = useState([]);
  const [casetas, setCasetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingConcert, setEditingConcert] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
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
      setConcerts(concertsData.data);
      setCasetas(casetasData.data);
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
        showToast('Concert updated successfully', 'success');
      } else {
        await concertService.createConcert(formData);
        showToast('Concert created successfully', 'success');
      }
      setShowForm(false);
      setEditingConcert(null);
      resetForm();
      loadData();
    } catch {
      setError('Error saving concert');
      showToast('Error saving concert', 'error');
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
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    try {
      await concertService.deleteConcert(deletingId);
      showToast('Concert deleted successfully', 'success');
      loadData();
    } catch {
      setError('Error deleting concert');
      showToast('Error deleting concert', 'error');
    } finally {
      setDeletingId(null);
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
                <button onClick={() => setDeletingId(concert._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Concert</h3>
              <button className="modal-close" onClick={() => setDeletingId(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="modal-body">Are you sure you want to delete this concert?</p>
            <div className="modal-actions">
              <button className="modal-btn-confirm" onClick={confirmDelete}>Delete</button>
              <button className="modal-btn-cancel" onClick={() => setDeletingId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Concerts;