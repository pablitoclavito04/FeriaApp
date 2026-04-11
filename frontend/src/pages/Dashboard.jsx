import useAuth from '../context/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.name}</h1>
      <p>FeriaApp Admin Panel</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;