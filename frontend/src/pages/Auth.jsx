import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  const fillDemo = () => setForm({ email: 'waqarali6489@gmail.com', password: 'Waqarali@6489' });

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="logo-icon"></div>
          AI Personal Finance
        </div>
        <div className="auth-title">Welcome back 👋</div>
        <div className="auth-sub">Sign in to your account</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@email.com" value={form.email}
              onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Sign up free</Link>
        </div>
        <div className="auth-demo">
          🔑 Demo Admin: <strong style={{cursor:'pointer',color:'var(--accent)'}} onClick={fillDemo}>admin@finance.pk / admin123</strong>
        </div>
        <div style={{textAlign:'center',marginTop:'12px'}}>
          <Link to="/" style={{fontSize:'0.8rem',color:'var(--muted)',textDecoration:'none'}}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ email:'', username:'', first_name:'', last_name:'', password:'', password2:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const set = (k) => (e) => setForm(p => ({...p, [k]: e.target.value}));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); 
    if (form.password !== form.password2) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register(form);
      nav('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.email?.[0] || data?.username?.[0] || data?.password?.[0] || 'Registration failed. Please check your input.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="logo-icon"></div>
          AI Personal Finance
        </div>
        <div className="auth-title">Create Account</div>
        <div className="auth-sub">Join thousands managing finances smarter</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" type="text" placeholder="Ali" value={form.first_name} onChange={set('first_name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" type="text" placeholder="Khan" value={form.last_name} onChange={set('last_name')} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" placeholder="alikhan123" value={form.username} onChange={set('username')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 chars" value={form.password} onChange={set('password')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm</label>
              <input className="form-input" type="password" placeholder="Repeat password" value={form.password2} onChange={set('password2')} required />
            </div>
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
        <div style={{textAlign:'center',marginTop:'12px'}}>
          <Link to="/" style={{fontSize:'0.8rem',color:'var(--muted)',textDecoration:'none'}}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
