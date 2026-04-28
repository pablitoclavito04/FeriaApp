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
  const [editErrors, setEditErrors] = useState({});

  // Create form state (bulk)
  const [createCaseta, setCreateCaseta] = useState('');
  const [createRows, setCreateRows] = useState(() =>
    Array.from({ length: INITIAL_ROWS }, emptyRow)
  );
  const [createErrors, setCreateErrors] = useState({});

  const validateEdit = () => {
    const newErrors = {};
    if (!editFormData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (editFormData.price === '' || editFormData.price === null) {
      newErrors.price = 'Price is required';
    } else if (Number(editFormData.price) <= 0) {
      newErrors.price = 'Price must be positive';
    }
    if (!editFormData.caseta) {
      newErrors.caseta = 'Please select a caseta';
    }
    return newErrors;
  };

  const updateEditField = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateCreate = (rows) => {
    const newErrors = {};
    if (!createCaseta) {
      newErrors.caseta = 'Please select a caseta';
    }

    const filled = rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => !isRowEmpty(row));

    if (filled.length === 0) {
      newErrors.rows = 'Add at least one menu item';
      return newErrors;
    }

    const rowErrors = {};
    let summary = '';
    for (const { row, index } of filled) {
      const cells = {};
      if (!row.name.trim()) {
        cells.name = true;
        if (!summary) summary = 'Every row needs a name';
      }
      if (row.price === '' || Number(row.price) <= 0) {
        cells.price = true;
        if (!summary) summary = 'Every row needs a positive price';
      }
      if (Object.keys(cells).length > 0) {
        rowErrors[index] = cells;
      }
    }

    if (Object.keys(rowErrors).length > 0) {
      newErrors.rowCells = rowErrors;
      newErrors.rows = summary;
    }

    return newErrors;
  };

  const loadData = async () => {
    try {
      const [menusData, casetasData] = await Promise.all([
        menuService.getMenus(),
        casetaService.getCasetas(),
      ]);
      setMenus(menusData.data);
      setCasetas(casetasData.data);
    } catch {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetCreateForm = () => {
    setCreateCaseta('');
    setCreateRows(Array.from({ length: INITIAL_ROWS }, emptyRow));
    setCreateErrors({});
  };

  const updateRow = (index, field, value) => {
    setCreateRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
    setCreateErrors((prev) => {
      if (!prev.rowCells?.[index]?.[field] && !prev.rows) return prev;
      const nextRowCells = { ...(prev.rowCells || {}) };
      if (nextRowCells[index]) {
        const { [field]: _omit, ...rest } = nextRowCells[index];
        if (Object.keys(rest).length === 0) {
          delete nextRowCells[index];
        } else {
          nextRowCells[index] = rest;
        }
      }
      const next = { ...prev, rowCells: nextRowCells };
      if (Object.keys(nextRowCells).length === 0) {
        delete next.rowCells;
        delete next.rows;
      }
      return next;
    });
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

    const filled = createRows.filter((row) => !isRowEmpty(row));
    const validationErrors = validateCreate(filled);
    if (Object.keys(validationErrors).length > 0) {
      setCreateErrors(validationErrors);
      return;
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
    const validationErrors = validateEdit();
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }
    try {
      await menuService.updateMenu(editingMenu._id, editFormData);
      showToast('Menu item updated successfully', 'success');
      setShowForm(false);
      setEditingMenu(null);
      setEditErrors({});
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
    setEditErrors({});
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
        <form onSubmit={handleEditSubmit} className="form-container" noValidate>
          <h2>Edit Menu Item</h2>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => updateEditField('name', e.target.value)}
              className={editErrors.name ? 'input-error' : ''}
            />
            {editErrors.name && <span className="field-error">{editErrors.name}</span>}
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={editFormData.description}
              onChange={(e) => updateEditField('description', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Price (€)</label>
            <input
              type="number"
              step="0.01"
              value={editFormData.price}
              onChange={(e) => updateEditField('price', e.target.value)}
              className={editErrors.price ? 'input-error' : ''}
            />
            {editErrors.price && <span className="field-error">{editErrors.price}</span>}
          </div>
          <div className="form-group">
            <label>Caseta</label>
            <select
              value={editFormData.caseta}
              onChange={(e) => updateEditField('caseta', e.target.value)}
              className={editErrors.caseta ? 'input-error' : ''}
            >
              <option value="">Select a caseta</option>
              {casetas.map((caseta) => (
                <option key={caseta._id} value={caseta._id}>
                  {caseta.number} - {caseta.name}
                </option>
              ))}
            </select>
            {editErrors.caseta && <span className="field-error">{editErrors.caseta}</span>}
          </div>
          <div className="form-actions">
            <button type="submit">Update</button>
            <button type="button" onClick={cancelForm}>Cancel</button>
          </div>
        </form>
      )}

      {showForm && !isEditing && (
        <form onSubmit={handleCreateSubmit} className="form-container" noValidate>
          <h2>New Menu Items</h2>
          <p className="form-hint">
            Add multiple items at once. Empty rows will be ignored.
          </p>

          <div className="form-group">
            <label>Caseta</label>
            <select
              value={createCaseta}
              onChange={(e) => {
                setCreateCaseta(e.target.value);
                if (createErrors.caseta) setCreateErrors((prev) => ({ ...prev, caseta: '' }));
              }}
              className={createErrors.caseta ? 'input-error' : ''}
            >
              <option value="">Select a caseta</option>
              {casetas.map((caseta) => (
                <option key={caseta._id} value={caseta._id}>
                  {caseta.number} - {caseta.name}
                </option>
              ))}
            </select>
            {createErrors.caseta && <span className="field-error">{createErrors.caseta}</span>}
          </div>

          <div className="bulk-rows">
            <div className="bulk-rows-header">
              <span>Name</span>
              <span>Description</span>
              <span>Price (€)</span>
              <span aria-hidden="true"></span>
            </div>
            {createRows.map((row, index) => {
              const cellErrors = createErrors.rowCells?.[index] || {};
              return (
                <div className="bulk-row" key={index}>
                  <input
                    type="text"
                    value={row.name}
                    placeholder="e.g. Salmorejo"
                    onChange={(e) => updateRow(index, 'name', e.target.value)}
                    className={cellErrors.name ? 'input-error' : ''}
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
                    className={cellErrors.price ? 'input-error' : ''}
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
              );
            })}
            <button type="button" className="bulk-row-add" onClick={addRow}>
              + Add row
            </button>
            {createErrors.rows && <span className="field-error">{createErrors.rows}</span>}
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
