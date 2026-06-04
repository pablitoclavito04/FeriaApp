import { useNavigate } from 'react-router-dom';
import logotipo from '../assets/logotipo.png';

// Entry screen: choose between signing in or registering.
const AccessChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="login">
      <div className="login__box">
        <div className="login__header">
          <div className="login__brand">
            <img src={logotipo} alt="FeriaApp" className="login__logo" />
            <h1>FeriaApp</h1>
          </div>
          <span className="login__subtitle">Admin Panel</span>
        </div>

        <div className="login__welcome">
          <p className="login__welcome-title">Welcome!</p>
          <p className="login__welcome-text">
            How do you want to access the FeriaApp admin panel?
          </p>
        </div>

        <button className="login__submit" onClick={() => navigate('/login')}>
          Sign in
        </button>
        <button
          className="login__submit"
          style={{ marginTop: '0.75rem', background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary)' }}
          onClick={() => navigate('/register')}
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default AccessChoice;
