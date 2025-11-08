const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { init } = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = init();

// GET /api/products
app.get('/api/products', (req, res) => {
  // optionally fetch from Fake Store API when USE_FAKE_STORE=true
  if (process.env.USE_FAKE_STORE === 'true') {
    (async () => {
      try {
        const r = await fetch('https://fakestoreapi.com/products');
        if (!r.ok) throw new Error('remote fetch failed')
        const remote = await r.json();
        // normalize fields to { id, name, price, desc }
        const mapped = remote.map(p => ({ id: p.id, name: p.title || p.name, price: Number(p.price), desc: p.description || '' }));
        return res.json(mapped);
      } catch (err) {
        console.warn('FakeStore fetch failed, falling back to local DB', err.message)
        // fallback to local DB below
      }
    })();
  }

  db.all('SELECT id, name, price, desc FROM products', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// GET /api/cart?userId=1
app.get('/api/cart', (req, res) => {
  const userId = req.query.userId || 1;
  const sql = `SELECT c.id as cartId, p.id as productId, p.name, p.price, c.qty
    FROM cart c JOIN products p ON c.productId = p.id WHERE c.userId = ?`;
  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error', detail: err.message });
    const total = rows.reduce((s, r) => s + r.price * r.qty, 0);
    res.json({ items: rows, total });
  });
});

// POST /api/cart { productId, qty }
app.post('/api/cart', (req, res) => {
  const { productId, qty, userId } = req.body;
  if (!productId || !qty) return res.status(400).json({ error: 'Missing productId or qty' });
  const uid = userId || 1;

  // check if exists for this user
  db.get('SELECT id, qty FROM cart WHERE productId = ? AND userId = ?', [productId, uid], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error', detail: err.message });
    if (row) {
      const newQty = row.qty + qty;
      db.run('UPDATE cart SET qty = ? WHERE id = ?', [newQty, row.id], function (uerr) {
        if (uerr) return res.status(500).json({ error: 'DB error', detail: uerr.message });
        res.json({ cartId: row.id, productId, qty: newQty, userId: uid });
      });
    } else {
      const addedAt = Date.now();
      db.run('INSERT INTO cart (productId, qty, addedAt, userId) VALUES (?, ?, ?, ?)', [productId, qty, addedAt, uid], function (ierr) {
        if (ierr) return res.status(500).json({ error: 'DB error', detail: ierr.message });
        res.json({ cartId: this.lastID, productId, qty, userId: uid });
      });
    }
  });
});

// DELETE /api/cart/:id
app.delete('/api/cart/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM cart WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'DB error', detail: err.message });
    res.json({ deleted: this.changes });
  });
});

// POST /api/cart/:id (update qty) - we'll accept as update route
app.post('/api/cart/:id', (req, res) => {
  const id = req.params.id;
  const { qty } = req.body;
  if (qty == null) return res.status(400).json({ error: 'Missing qty' });
  db.run('UPDATE cart SET qty = ? WHERE id = ?', [qty, id], function (err) {
    if (err) return res.status(500).json({ error: 'DB error', detail: err.message });
    res.json({ updated: this.changes });
  });
});

// POST /api/checkout { cartItems, name, email }
app.post('/api/checkout', (req, res) => {
  const { cartItems, name, email } = req.body;
  if (!cartItems || !Array.isArray(cartItems)) return res.status(400).json({ error: 'Missing cartItems' });

  // compute total
  const placeholders = cartItems.map(() => '?').join(',');
  const productIds = cartItems.map((i) => i.productId);
  if (productIds.length === 0) return res.status(400).json({ error: 'Empty cart' });

  db.all(`SELECT id, price, name FROM products WHERE id IN (${placeholders})`, productIds, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error', detail: err.message });
    const priceMap = new Map(rows.map(r => [r.id, r]));
    let total = 0;
    for (const it of cartItems) {
      const p = priceMap.get(it.productId);
      if (p) total += p.price * it.qty;
    }
    const receipt = {
      id: Date.now(),
      name: name || 'Guest',
      email: email || null,
      total: Number(total.toFixed(2)),
      items: cartItems,
      timestamp: new Date().toISOString()
    };

    // clear cart for all users (simple mock) - alternatively, could clear per user
    db.run('DELETE FROM cart', [], function (derr) {
      if (derr) console.error('Failed to clear cart', derr);
      res.json({ receipt });
    });
  });
});

// Simple users endpoints
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  // check existing
  db.get('SELECT id, name, email FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error', detail: err.message });
    if (row) return res.json(row);
    db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name || null, email], function (ierr) {
      if (ierr) return res.status(500).json({ error: 'DB error', detail: ierr.message });
      db.get('SELECT id, name, email FROM users WHERE id = ?', [this.lastID], (gerr, saved) => {
        if (gerr) return res.status(500).json({ error: 'DB error', detail: gerr.message });
        res.json(saved);
      });
    });
  });
});

app.get('/api/users/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT id, name, email FROM users WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error', detail: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
