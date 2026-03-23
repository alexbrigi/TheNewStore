(async () => {
  try {
    const base = 'http://localhost:5000';
    const loginRes = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@admin', password: 'adminadmin' }),
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login failed:', loginJson);
      process.exit(1);
    }
    const token = loginJson.token;
    console.log('Logged in. Token obtained.');

    const ordersRes = await fetch(base + '/api/orders', { headers: { Authorization: 'Bearer ' + token } });
    const orders = await ordersRes.json();
    if (!orders || orders.length === 0) {
      console.error('No orders found:', orders);
      process.exit(1);
    }
    console.log('Found orders:', orders.length);
    const id = orders[0].id;
    console.log('Simulating payment for order id', id);

    const simRes = await fetch(base + `/api/payments/simulate/${id}`, { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
    const simJson = await simRes.json();
    console.log('Simulate response:', simRes.status, simJson);
  } catch (e) {
    console.error('Error during test:', e);
    process.exit(1);
  }
})();
