import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../context/useAuth';
import useToast from '../context/useToast';
import logotipo from '../assets/logotipo.png';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) newErrors.name = 'Name is required';
    else if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address';

    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (confirm !== password) newErrors.confirm = 'Passwords do not match';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const data = await register(name, email, password);
      showToast(`Welcome, ${data.name}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'EMAIL_IN_USE') {
        setErrors({ email: 'Email is already in use' });
      } else {
        setErrors({ general: 'Could not register. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__box">
        <button
          type="button"
          className="login__close"
          onClick={() => navigate('/')}
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="login__header">
          <div className="login__brand">
            <img src={logotipo} alt="FeriaApp" className="login__logo" />
            <h1>FeriaApp</h1>
          </div>
          <span className="login__subtitle">Admin Panel</span>
        </div>

        <div className="login__welcome">
          <p className="login__welcome-title">Create your account</p>
          <p className="login__welcome-text">New accounts start with the viewer role.</p>
        </div>

        <h2 className="login__title">Sign up</h2>

        {errors.general && <p className="login__error">{errors.general}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="login__field">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="Name"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="login__field">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="Email"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="login__field">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="Password"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <div className="login__field">
            <input
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: '' }));
              }}
              placeholder="Confirm password"
              className={errors.confirm ? 'input-error' : ''}
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>
          <button type="submit" className="login__submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="login__alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
