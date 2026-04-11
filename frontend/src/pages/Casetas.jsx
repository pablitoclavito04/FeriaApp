import { useState, useEffect } from 'react';
import casetaService from '../services/casetaService';
import fairService from '../services/fairService';

const Casetas = () => {
  const [casetas, setCasetas] = useState([]);
  const [fairs, setFairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCaseta, setEditingCaseta] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    description: '',
    fair: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [casetasData, fairsData] = await Promise.all([
        casetaService.getCasetas(),
        fairService.getFairs(),
      ]);
      setCasetas(casetasData);
      setFairs(fairsData);
    } catch {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCaseta) {
        await casetaService.updateCaseta(editingCaseta._id, formData);
      } else {
        await casetaService.createCaseta(formData);
      }
      setShowForm(false);
      setEditingCaseta(null);
      resetForm();
      loadData();
    } catch {
      setError('Error saving caseta');
    }
  };

  const handleEdit = (caseta) => {
    setEditingCaseta(caseta);
    setFormData({
      name: caseta.name,
      number: caseta.number,
      description: caseta.description,
      fair: caseta.fair?._id || caseta.fair,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this caseta?')) {
      try {
        await casetaService.deleteCaseta(id);
        loadData();
      } catch {
        setError('Error deleting caseta');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      description: '',
      fair: '',
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Casetas</h1>
        <button onClick={() => { resetForm(); setEditingCaseta(null); setShowForm(true); }}>
          + New Caseta
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <h2>{editingCaseta ? 'Edit Caseta' : 'New Caseta'}</h2>
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
            <label>Number</label>
            <input
              type="number"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
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
            <label>Fair</label>
            <select
              value={formData.fair}
              onChange={(e) => setFormData({ ...formData, fair: e.target.value })}
              required
            >
              <option value="">Select a fair</option>
              {fairs.map((fair) => (
                <option key={fair._id} value={fair._id}>
                  {fair.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="submit">{editingCaseta ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Number</th>
            <th>Name</th>
            <th>Description</th>
            <th>Fair</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {casetas.map((caseta) => (
            <tr key={caseta._id}>
              <td>{caseta.number}</td>
              <td>{caseta.name}</td>
              <td>{caseta.description}</td>
              <td>{caseta.fair?.name}</td>
              <td>
                <button onClick={() => handleEdit(caseta)}>Edit</button>
                <button onClick={() => handleDelete(caseta._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Casetas;