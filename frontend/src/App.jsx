import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import AccessChoice from './pages/AccessChoice';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Fairs from './pages/Fairs';
import Casetas from './pages/Casetas';
import Menus from './pages/Menus';
import Concerts from './pages/Concerts';
import Users from './pages/Users';
import useAuth from './context/useAuth';

const Layout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
);

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/access" element={user ? <Navigate to="/dashboard" /> : <AccessChoice />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/fairs" element={
        <PrivateRoute>
          <Layout>
            <Fairs />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/casetas" element={
        <PrivateRoute>
          <Layout>
            <Casetas />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/menus" element={
        <PrivateRoute>
          <Layout>
            <Menus />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/concerts" element={
        <PrivateRoute>
          <Layout>
            <Concerts />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/users" element={
        <PrivateRoute requiredRole="admin">
          <Layout>
            <Users />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/access" />} />
    </Routes>
  );
};

export default App;