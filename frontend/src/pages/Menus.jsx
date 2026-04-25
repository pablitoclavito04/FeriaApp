import { useState, useEffect } from 'react';
import menuService from '../services/menuService';
import casetaService from '../services/casetaService';
import useToast from '../context/useToast';

const INITIAL_ROWS = 3;
const emptyRow = () => ({ name: '', description: '', price: '' });

const Menus = () => {
  const { showToast } = useToast();
  const [menus, setMenus] = useState([]);
  const [casetas, setCasetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Edit form state (single item)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    caseta: '',
  });

  // Create form state (bulk)
  const [createCaseta, setCreateCaseta] = useState('');
  const [createRows, setCreateRows] = useState(() =>
    Array.from({ length: INITIAL_ROWS }, emptyRow)
  );

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

  const resetCreateForm = () => {
    setCreateCaseta('');
    setCreateRows(Array.from({ length: INITIAL_ROWS }, emptyRow));
  };

  const updateRow = (index, field, value) => {
    setCreateRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setCreateRows((rows) => [...rows, emptyRow()]);
  };

  const removeRow = (index) => {
    setCreateRows((rows) => (rows.length === 1 ? rows : rows.filter((_, i) => i !== index)));
  };

  const isRowEmpty = (row) =>
    !row.name.trim() && !row.description.trim() && row.price === '';

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!createCaseta) {
      showToast('Please select a caseta', 'error');
      return;
    }

    const filled = createRows.filter((row) => !isRowEmpty(row));

    if (filled.length === 0) {
      showToast('Please add at least one menu item', 'error');
      return;
    }

    for (const row of filled) {
      if (!row.name.trim() || row.price === '') {
        showToast('Each item needs at least a name and a price', 'error');
        return;
      }
    }

    try {
      const items = filled.map((row) => ({
        name: row.name.trim(),
        description: row.description.trim(),
        price: Number(row.price),
      }));
      await menuService.createMenusBulk(createCaseta, items);
      showToast(`${items.length} menu item(s) created successfully`, 'success');
      setShowForm(false);
      resetCreateForm();
      loadData();
    } catch {
      setError('Error saving menu items');
      showToast('Error saving menu items', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await menuService.updateMenu(editingMenu._id, editFormData);
      showToast('Menu item updated successfully', 'success');
      setShowForm(false);
      setEditingMenu(null);
      loadData();
    } catch {
      setError('Error saving menu item');
      showToast('Error saving menu item', 'error');
    }
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setEditFormData({
      name: menu.name,
      description: menu.description,
      price: menu.price,
      caseta: menu.caseta?._id || menu.caseta,
    });
    setShowForm(true);
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
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

  const openCreateForm = () => {
    setEditingMenu(null);
    resetCreateForm();
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingMenu(null);
    resetCreateForm();
  };

  if (loading) return <p>Loading...</p>;

  const isEditing = !!editingMenu;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Menus</h1>
        <button onClick={openCreateForm}>+ New Menu</button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && isEditing && (
        <form onSubmit={handleEditSubmit} className="form-container">
          <h2>Edit Menu Item</h2>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Price (€)</label>
            <input
              type="number"
              step="0.01"
              value={editFormData.price}
              onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Caseta</label>
            <select
              value={editFormData.caseta}
              onChange={(e) => setEditFormData({ ...editFormData, caseta: e.target.value })}
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
            <button type="submit">Update</button>
            <button type="button" onClick={cancelForm}>Cancel</button>
          </div>
        </form>
      )}

      {showForm && !isEditing && (
        <form onSubmit={handleCreateSubmit} className="form-container">
          <h2>New Menu Items</h2>
          <p className="form-hint">
            Add multiple items at once. Empty rows will be ignored.
          </p>

          <div className="form-group">
            <label>Caseta</label>
            <select
              value={createCaseta}
              onChange={(e) => setCreateCaseta(e.target.value)}
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

          <div className="bulk-rows">
            <div className="bulk-rows-header">
              <span>Name</span>
              <span>Description</span>
              <span>Price (€)</span>
              <span aria-hidden="true"></span>
            </div>
            {createRows.map((row, index) => (
              <div className="bulk-row" key={index}>
                <input
                  type="text"
                  value={row.name}
                  placeholder="e.g. Salmorejo"
                  onChange={(e) => updateRow(index, 'name', e.target.value)}
                />
                <input
                  type="text"
                  value={row.description}
                  placeholder="Optional"
                  onChange={(e) => updateRow(index, 'description', e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  value={row.price}
                  placeholder="0.00"
                  onChange={(e) => updateRow(index, 'price', e.target.value)}
                />
                <button
                  type="button"
                  className="bulk-row-remove"
                  onClick={() => removeRow(index)}
                  disabled={createRows.length === 1}
                  aria-label="Remove row"
                  title="Remove row"
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="bulk-row-add" onClick={addRow}>
              + Add row
            </button>
          </div>

          <div className="form-actions">
            <button type="submit">Create</button>
            <button type="button" onClick={cancelForm}>Cancel</button>
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
