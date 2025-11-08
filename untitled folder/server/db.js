const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'store.db');

function init() {
  const exists = fs.existsSync(DB_PATH);
  const db = new sqlite3.Database(DB_PATH);

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT,
      price REAL,
      desc TEXT
    )`);

    // simple users table (mock user persistence)
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT
    )`);

    // cart now includes optional userId to tie carts to a user (defaults to 1)
    db.run(`CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER,
      qty INTEGER,
      addedAt INTEGER,
      userId INTEGER DEFAULT 1
    )`);

    if (!exists) {
      // seed products
      const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json')));
      const stmt = db.prepare('INSERT INTO products (id, name, price, desc) VALUES (?, ?, ?, ?)');
      for (const p of products) {
        stmt.run(p.id, p.name, p.price, p.desc);
      }
      stmt.finalize();
    }
  });

  return db;
}

module.exports = { init };
