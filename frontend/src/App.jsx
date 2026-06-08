import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import AccessChoice from './pages/AccessChoice';
import useAuth from './context/useAuth';
import lazyWithRetry from './utils/lazyWithRetry';

// Lazy-loaded route pages: each becomes its own JS chunk that the browser only
// downloads when the user navigates to it, keeping the initial bundle small.
// lazyWithRetry reloads once if a chunk 404s after a deploy (stale index.html),
// so the page never hangs on the "Loading…" fallback.
const Login = lazyWithRetry(() => import('./pages/Login'));
const Register = lazyWithRetry(() => import('./pages/Register'));
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const Fairs = lazyWithRetry(() => import('./pages/Fairs'));
const Casetas = lazyWithRetry(() => import('./pages/Casetas'));
const Menus = lazyWithRetry(() => import('./pages/Menus'));
const Concerts = lazyWithRetry(() => import('./pages/Concerts'));
const Users = lazyWithRetry(() => import('./pages/Users'));

const Layout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
);

// Shown while a lazy-loaded page chunk is being downloaded.
const PageLoader = () => <p className="page-loader">Loading…</p>;

const App = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
};

export default App;