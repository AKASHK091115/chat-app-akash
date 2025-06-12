import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError('Please fill all fields');
      return;
    }

    if (!validateEmail(form.email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:3305/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Registration successful! You can now login.');
        navigate('/login')
        setForm({ name: '', email: '', password: '' });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Server error, please try again later.');
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
       <button
      type="button"
      onClick={() => navigate('/login')}
      style={{
        marginBottom: 16,
        padding: '10px 15px',
        borderRadius: 8,
        border: 'none',
        backgroundColor: '#ccc',
        color: '#333',
        cursor: 'pointer',
        fontWeight: '600',
      }}
    >
      Back to Login
    </button>
      <h2 style={styles.title}>Register</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {['name', 'email', 'password'].map((field, i) => (
          <input
            key={i}
            type={field === 'password' ? 'password' : 'text'}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={form[field]}
            onChange={handleChange}
            style={styles.input}
            autoComplete="off"
          />
        ))}
        <button
          type="submit"
          style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: '4rem auto',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#222',
    letterSpacing: 1.2,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '12px 16px',
    marginBottom: 20,
    borderRadius: 8,
    border: '1.5px solid #ccc',
    fontSize: 16,
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    outline: 'none',
  },
  button: {
    padding: 14,
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #4a90e2, #357ABD)',
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    cursor: 'pointer',
    boxShadow: '0 6px 12px rgba(53, 122, 189, 0.5)',
    transition: 'background 0.3s ease',
  },
  error: {
    marginTop: 16,
    color: '#e74c3c',
    textAlign: 'center',
    fontWeight: '600',
  },
  success: {
    marginTop: 16,
    color: '#27ae60',
    textAlign: 'center',
    fontWeight: '600',
  },
};

// Add input focus style with JS since inline styles don't support :focus
document.addEventListener('focusin', (e) => {
  if (e.target.tagName === 'INPUT') {
    e.target.style.borderColor = '#357ABD';
    e.target.style.boxShadow = '0 0 8px rgba(53, 122, 189, 0.6)';
  }
});
document.addEventListener('focusout', (e) => {
  if (e.target.tagName === 'INPUT') {
    e.target.style.borderColor = '#ccc';
    e.target.style.boxShadow = 'none';
  }
});
