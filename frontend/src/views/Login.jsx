import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate Gmail domain restriction, simulate Google Auth loading wheel, call api/auth/login
  };

  return (
    <div className="login-view">
      {/* Google Sign-In email-only entry form */}
    </div>
  );
}

export default Login;
