import { useState, useEffect } from 'react';
import fairService from '../services/fairService';
import useToast from '../context/useToast';

const Fairs = () => {
  const { showToast } = useToast();
  const [fairs, setFairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFair, setEditingFair] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
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
        showToast('Fair updated successfully', 'success');
      } else {
        await fairService.createFair(formData);
        showToast('Fair created successfully', 'success');
      }
      setShowForm(false);
      setEditingFair(null);
      resetForm();
      loadFairs();
    } catch {
      setError('Error saving fair');
      showToast('Error saving fair', 'error');
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

  const confirmDelete = async () => {
    try {
      await fairService.deleteFair(deletingId);
      showToast('Fair deleted successfully', 'success');
      loadFairs();
    } catch {
      setError('Error deleting fair');
      showToast('Error deleting fair', 'error');
    } finally {
      setDeletingId(null);
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
                <button onClick={() => setDeletingId(fair._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Fair</h3>
              <button className="modal-close" onClick={() => setDeletingId(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="modal-body">Are you sure you want to delete this fair?</p>
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

export default Fairs;