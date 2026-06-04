import { useState, useEffect } from 'react';
import userService from '../services/userService';
import useToast from '../context/useToast';

const ROLES = ['admin', 'editor', 'viewer'];

const Users = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch {
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await userService.updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
      showToast('Role updated', 'success');
    } catch {
      showToast('Error updating role', 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      await userService.deleteUser(deletingId);
      setUsers((prev) => prev.filter((u) => u._id !== deletingId));
      showToast('User deleted', 'success');
    } catch {
      showToast('Error deleting user', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Users</h1>
      </div>

      {error && <p className="error">{error}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan="4">No other users registered yet.</td>
            </tr>
          )}
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td>
                <button onClick={() => setDeletingId(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete User</h3>
              <button className="modal-close" onClick={() => setDeletingId(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="modal-body">Are you sure you want to delete this user?</p>
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

export default Users;
