import { useState, useEffect } from 'react';
import menuService from '../services/menuService';
import casetaService from '../services/casetaService';
import useToast from '../context/useToast';

const Menus = () => {
  const { showToast } = useToast();
  const [menus, setMenus] = useState([]);
  const [casetas, setCasetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    caseta: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [menusData, casetasData] = await Promise.all([
        menuService.getMenus(),
        casetaService.getCasetas(),
      ]);
      setMenus(menusData);
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
      if (editingMenu) {
        await menuService.updateMenu(editingMenu._id, formData);
        showToast('Menu item updated successfully', 'success');
      } else {
        await menuService.createMenu(formData);
        showToast('Menu item created successfully', 'success');
      }
      setShowForm(false);
      setEditingMenu(null);
      resetForm();
      loadData();
    } catch {
      setError('Error saving menu item');
      showToast('Error saving menu item', 'error');
    }
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      description: menu.description,
      price: menu.price,
      caseta: menu.caseta?._id || menu.caseta,
    });
    setShowForm(true);
  };

  const confirmDelete = async () => {
    try {
      await menuService.deleteMenu(deletingId);
      showToast('Menu item deleted successfully', 'success');
      loadData();
    } catch {
      setError('Error deleting menu item');
      showToast('Error deleting menu item', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      caseta: '',
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Menus</h1>
        <button onClick={() => { resetForm(); setEditingMenu(null); setShowForm(true); }}>
          + New Menu
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <h2>{editingMenu ? 'Edit Menu Item' : 'New Menu Item'}</h2>
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
            <label>Price (€)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
            <button type="submit">{editingMenu ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Caseta</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {menus.map((menu) => (
            <tr key={menu._id}>
              <td>{menu.name}</td>
              <td>{menu.description}</td>
              <td>{menu.price}€</td>
              <td>{menu.caseta?.name}</td>
              <td>
                <button onClick={() => handleEdit(menu)}>Edit</button>
                <button onClick={() => setDeletingId(menu._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Menu Item</h3>
              <button className="modal-close" onClick={() => setDeletingId(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="modal-body">Are you sure you want to delete this menu item?</p>
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

export default Menus;