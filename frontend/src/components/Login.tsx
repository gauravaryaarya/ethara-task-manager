import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Member');
  const [adminKey, setAdminKey] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      if (isRegister) {
        await API.post('/auth/register', { name, email, password, role, adminKey });
        setMessage('Account provisioned. Please authenticate.');
        setTimeout(() => {
          setIsRegister(false);
          setMessage('');
        }, 2000);
      } else {
        const { data } = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      setMessage('Invalid credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  const css = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body, #root {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background-color: #000000;
    }
    .split-layout {
      display: flex;
      height: 100vh;
      width: 100vw;
      background-color: #000000;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .brand-section {
      flex: 1;
      display: none;
      flex-direction: column;
      padding: 60px;
      background-color: #050505;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      border-right: 1px solid #111111;
    }
    @media (min-width: 768px) {
      .brand-section {
        display: flex;
      }
    }
    .form-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px;
      background-color: #000000;
    }
    .form-container {
      width: 100%;
      max-width: 360px;
    }
    .sleek-input {
      width: 100%;
      padding: 12px 0;
      background: transparent;
      border: none;
      border-bottom: 1px solid #333333;
      color: #ffffff;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }
    .sleek-input:focus {
      border-bottom: 1px solid #ffffff;
    }
    .primary-btn {
      width: 100%;
      padding: 14px;
      margin-top: 24px;
      background-color: #ffffff;
      color: #000000;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: transform 0.1s ease, opacity 0.2s ease;
    }
    .primary-btn:hover {
      opacity: 0.9;
    }
    .primary-btn:active {
      transform: scale(0.98);
    }
    .secondary-btn {
      width: 100%;
      padding: 12px;
      margin-top: 16px;
      background-color: #0a0a0a;
      color: #dddddd;
      border: 1px solid #222222;
      border-radius: 4px;
      font-weight: 500;
      font-size: 14px;
      cursor: not-allowed;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      transition: background-color 0.2s ease;
    }
    .secondary-btn:hover {
      background-color: #111111;
    }
  `;

  return (
    <div className="split-layout">
      <style>{css}</style>
      
      <div className="brand-section">
        <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', color: '#ffffff' }}>
          Ethara AI
        </div>
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <h1 style={{ fontSize: '72px', fontWeight: '600', lineHeight: '1', letterSpacing: '-0.04em', margin: 0, color: '#ffffff' }}>
            Team Task<br/>Manager
          </h1>
        </div>
      </div>

      <div className="form-section">
        <div className="form-container">
          
          <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {isRegister ? 'Initialize Workspace' : 'Welcome back'}
          </h2>
          <p style={{ color: '#888888', fontSize: '14px', margin: '0 0 40px 0' }}>
            {isRegister ? 'Enter details to provision your account.' : 'Enter your credentials to continue.'}
          </p>

          {message && (
            <div style={{ padding: '12px', marginBottom: '24px', fontSize: '13px', backgroundColor: '#111111', borderLeft: `2px solid ${message.includes('denied') ? '#ff4444' : '#ffffff'}`, color: '#dddddd' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isRegister && (
              <>
                <div>
                  <input type="text" placeholder="Full Name" onChange={e => setName(e.target.value)} required className="sleek-input" />
                </div>
                
                <div style={{ marginTop: '8px' }}>
                  <select value={role} onChange={e => setRole(e.target.value)} className="sleek-input" style={{ cursor: 'pointer', appearance: 'none', borderRadius: 0 }}>
                    <option value="Member" style={{ backgroundColor: '#000' }}>Team Member</option>
                    <option value="Admin" style={{ backgroundColor: '#000' }}>Workspace Admin</option>
                  </select>
                </div>

                {role === 'Admin' && (
                  <input 
                    type="password" 
                    placeholder="Admin Secret Key" 
                    onChange={e => setAdminKey(e.target.value)} 
                    required 
                    className="sleek-input" 
                    style={{ marginTop: '12px', borderBottomColor: '#ff4444' }} 
                  />
                )}
              </>
            )}
            
            <div style={{ marginTop: '8px' }}>
              <input type="email" placeholder="Email Address" onChange={e => setEmail(e.target.value)} required className="sleek-input" />
            </div>

            <div style={{ marginTop: '8px' }}>
              <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required className="sleek-input" />
            </div>
            
            <button type="submit" disabled={loading} className="primary-btn" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Authenticating...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div style={{ margin: '32px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #222222', margin: 0 }} />
            <span style={{ color: '#555555', fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em' }}>OR</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #222222', margin: 0 }} />
          </div>

          <button type="button" className="secondary-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Continue with Google
          </button>
          
          <p style={{ marginTop: '12px', fontSize: '12px', color: '#444444', textAlign: 'center' }}>
            OAuth configuration pending deployment.
          </p>

          <p style={{ marginTop: '40px', fontSize: '13px', color: '#666666', textAlign: 'center' }}>
            {isRegister ? 'Already established? ' : "No account? "}
            <span 
              style={{ color: '#ffffff', cursor: 'pointer', fontWeight: '500' }} 
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Sign in' : 'Create workspace'}
            </span>
          </p>
          
        </div>
      </div>
    </div>
  );
}