import { useState, useEffect } from 'react';
import casetaService from '../services/casetaService';
import fairService from '../services/fairService';
import MapPicker from '../components/MapPicker';
import useToast from '../context/useToast';

const Casetas = () => {
  const { showToast } = useToast();
  const [casetas, setCasetas] = useState([]);
  const [fairs, setFairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCaseta, setEditingCaseta] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    description: '',
    fair: '',
    location: { x: null, y: null },
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (formData.number === '' || formData.number === null) {
      newErrors.number = 'Number is required';
    } else if (Number(formData.number) <= 0) {
      newErrors.number = 'Number must be positive';
    }
    if (!formData.fair) {
      newErrors.fair = 'Please select a fair';
    }
    if (formData.location?.x == null || formData.location?.y == null) {
      newErrors.location = 'Please select a location on the map';
    }
    return newErrors;
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const loadData = async () => {
    try {
      const [casetasData, fairsData] = await Promise.all([
        casetaService.getCasetas(),
        fairService.getFairs(),
      ]);
      setCasetas(casetasData.data);
      setFairs(fairsData.data);
    } catch {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (latlng) => {
    setFormData((prev) => ({
      ...prev,
      location: { x: latlng.lat, y: latlng.lng },
    }));
    if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('number', formData.number);
      data.append('description', formData.description);
      data.append('fair', formData.fair);
      data.append('location[x]', formData.location.x);
      data.append('location[y]', formData.location.y);
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingCaseta) {
        await casetaService.updateCaseta(editingCaseta._id, data);
        showToast('Caseta updated successfully', 'success');
      } else {
        await casetaService.createCaseta(data);
        showToast('Caseta created successfully', 'success');
      }
      setShowForm(false);
      setEditingCaseta(null);
      resetForm();
      loadData();
    } catch {
      setError('Error saving caseta');
      showToast('Error saving caseta', 'error');
    }
  };

  const handleEdit = (caseta) => {
    setEditingCaseta(caseta);
    setFormData({
      name: caseta.name,
      number: caseta.number,
      description: caseta.description,
      fair: caseta.fair?._id || caseta.fair,
      location: caseta.location || { x: null, y: null },
    });
    setImagePreview(caseta.image ? `http://localhost:5000${caseta.image}` : null);
    setShowForm(true);
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    try {
      await casetaService.deleteCaseta(deletingId);
      showToast('Caseta deleted successfully', 'success');
      loadData();
    } catch {
      setError('Error deleting caseta');
      showToast('Error deleting caseta', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      description: '',
      fair: '',
      location: { x: null, y: null },
    });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
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
        <form onSubmit={handleSubmit} className="form-container" noValidate>
          <h2>{editingCaseta ? 'Edit Caseta' : 'New Caseta'}</h2>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Number</label>
            <input
              type="number"
              value={formData.number}
              onChange={(e) => updateField('number', e.target.value)}
              className={errors.number ? 'input-error' : ''}
            />
            {errors.number && <span className="field-error">{errors.number}</span>}
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Fair</label>
            <select
              value={formData.fair}
              onChange={(e) => updateField('fair', e.target.value)}
              className={errors.fair ? 'input-error' : ''}
            >
              <option value="">Select a fair</option>
              {fairs.map((fair) => (
                <option key={fair._id} value={fair._id}>
                  {fair.name}
                </option>
              ))}
            </select>
            {errors.fair && <span className="field-error">{errors.fair}</span>}
          </div>
          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '0.5rem', borderRadius: '8px' }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Location on map</label>
            <MapPicker
              onLocationSelect={handleLocationSelect}
              initialPosition={
                formData.location?.x
                  ? { lat: formData.location.x, lng: formData.location.y }
                  : null
              }
            />
            {formData.location?.x && (
              <p className="location-info">
                Selected: {formData.location.x.toFixed(4)}, {formData.location.y.toFixed(4)}
              </p>
            )}
            {errors.location && <span className="field-error">{errors.location}</span>}
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
            <th>Image</th>
            <th>Location</th>
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
                {caseta.image
                  ? <img src={`http://localhost:5000${caseta.image}`} alt={caseta.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  : 'No image'}
              </td>
              <td>
                {caseta.location?.x
                  ? `${caseta.location.x.toFixed(4)}, ${caseta.location.y.toFixed(4)}`
                  : 'Not set'}
              </td>
              <td>
                <button onClick={() => handleEdit(caseta)}>Edit</button>
                <button onClick={() => setDeletingId(caseta._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Caseta</h3>
              <button className="modal-close" onClick={() => setDeletingId(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="modal-body">Are you sure you want to delete this caseta?</p>
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

export default Casetas;