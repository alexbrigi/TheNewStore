(async () => {
  try {
    const base = 'http://localhost:5000';
    // Login
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
    console.log('Logged in as admin.');

    // Get products
    const prodRes = await fetch(base + '/api/products');
    const prodJson = await prodRes.json();
    const products = Array.isArray(prodJson) ? prodJson : (prodJson.products || []);
    const product = products.find(p => p.stock && p.stock > 0);
    if (!product) {
      console.error('No product with stock available');
      process.exit(1);
    }
    console.log('Using product:', product.id, product.name, 'stock', product.stock);

    // Add to cart
    const addRes = await fetch(base + '/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });
    const addJson = await addRes.json();
    if (!addRes.ok) {
      console.error('Add to cart failed', addJson);
      process.exit(1);
    }
    console.log('Added to cart:', addJson.id || addJson);

    // Create order
    const orderRes = await fetch(base + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ address: 'Calle Falsa 123', city: 'Madrid', postalCode: '28001', phone: '600000000', notes: 'Prueba' }),
    });
    const orderJson = await orderRes.json();
    if (!orderRes.ok) {
      console.error('Create order failed', orderJson);
      process.exit(1);
    }
    console.log('Order created:', orderJson.id);

    // Simulate payment
    const simRes = await fetch(base + `/api/payments/simulate/${orderJson.id}`, { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
    const simJson = await simRes.json();
    console.log('Simulate response:', simRes.status, simJson);

    // Fetch order status
    const ordersRes = await fetch(base + '/api/orders', { headers: { Authorization: 'Bearer ' + token } });
    const orders = await ordersRes.json();
    const created = orders.find(o => o.id === orderJson.id);
    console.log('Order after simulation:', created);
  } catch (e) {
    console.error('Error during full test:', e);
    process.exit(1);
  }
})();
