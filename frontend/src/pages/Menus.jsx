import { useState, useEffect } from 'react';
import menuService from '../services/menuService';
import casetaService from '../services/casetaService';

const Menus = () => {
  const [menus, setMenus] = useState([]);
  const [casetas, setCasetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
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
      } else {
        await menuService.createMenu(formData);
      }
      setShowForm(false);
      setEditingMenu(null);
      resetForm();
      loadData();
    } catch {
      setError('Error saving menu item');
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuService.deleteMenu(id);
        loadData();
      } catch {
        setError('Error deleting menu item');
      }
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
          + New Menu Item
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
                <button onClick={() => handleDelete(menu._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Menus;