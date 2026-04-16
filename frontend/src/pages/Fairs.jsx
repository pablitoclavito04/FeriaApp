import { useState, useEffect } from 'react';
import fairService from '../services/fairService';

const Fairs = () => {
  const [fairs, setFairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFair, setEditingFair] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    active: false,
  });

  useEffect(() => {
    loadFairs();
  }, []);

  const loadFairs = async () => {
    try {
      const data = await fairService.getFairs();
      setFairs(data);
    } catch {
      setError('Error loading fairs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFair) {
        await fairService.updateFair(editingFair._id, formData);
      } else {
        await fairService.createFair(formData);
      }
      setShowForm(false);
      setEditingFair(null);
      resetForm();
      loadFairs();
    } catch {
      setError('Error saving fair');
    }
  };

  const handleEdit = (fair) => {
    setEditingFair(fair);
    setFormData({
      name: fair.name,
      description: fair.description,
      startDate: fair.startDate?.split('T')[0],
      endDate: fair.endDate?.split('T')[0],
      location: fair.location,
      active: fair.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fair?')) {
      try {
        await fairService.deleteFair(id);
        loadFairs();
      } catch {
        setError('Error deleting fair');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      active: false,
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Fairs</h1>
        <button onClick={() => { resetForm(); setEditingFair(null); setShowForm(true); }}>
          + New Fair
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <h2>{editingFair ? 'Edit Fair' : 'New Fair'}</h2>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              Active
            </label>
          </div>
          <div className="form-actions">
            <button type="submit">{editingFair ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fairs.map((fair) => (
            <tr key={fair._id}>
              <td>{fair.name}</td>
              <td>{fair.location}</td>
              <td>{new Date(fair.startDate).toLocaleDateString()}</td>
              <td>{new Date(fair.endDate).toLocaleDateString()}</td>
              <td>
                <span className={`badge ${fair.active ? 'badge-success' : 'badge-muted'}`}>
                  {fair.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <button onClick={() => handleEdit(fair)}>Edit</button>
                <button onClick={() => handleDelete(fair._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Fairs;