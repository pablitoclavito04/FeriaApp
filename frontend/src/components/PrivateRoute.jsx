import { Navigate } from 'react-router-dom';
import useAuth from '../context/useAuth';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/access" />;

  // Role-gated route: send unauthorized users back to the dashboard.
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" />;

  return children;
};

export default PrivateRoute;