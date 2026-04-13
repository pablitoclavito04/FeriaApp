import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fairs from './pages/Fairs';
import Casetas from './pages/Casetas';
import Menus from './pages/Menus';
import Concerts from './pages/Concerts';
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
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
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
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;