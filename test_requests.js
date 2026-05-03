(async () => {
  const fetch = global.fetch || (await import('node-fetch')).default;
  const base = 'http://localhost:5000/api/auth';

  async function post(path, body) {
    try {
      const res = await fetch(`${base}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      console.log('REQUEST', path);
      console.log('STATUS', res.status);
      console.log('BODY', text);
    } catch (e) {
      console.error('ERROR', path, e.message);
    }
  }

  // Try to register a test user
  await post('register', { fullName: 'Test User', username: 'testuser', email: 'test@example.com', password: 'password123' });
  await post('forgot-password', { email: 'test@example.com' });
  await post('verify-reset-otp', { email: 'test@example.com', otp: '123456' });
  await post('reset-password', { email: 'test@example.com', otp: '123456', newPassword: 'newpass123' });
})();
