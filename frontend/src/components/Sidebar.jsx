import { NavLink } from 'react-router-dom';
import useAuth from '../context/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>FeriaApp</h2>
        <p>Admin Panel</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/fairs">Fairs</NavLink>
        <NavLink to="/casetas">Casetas</NavLink>
        <NavLink to="/menus">Menus</NavLink>
        <NavLink to="/concerts">Concerts</NavLink>
      </nav>
      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;