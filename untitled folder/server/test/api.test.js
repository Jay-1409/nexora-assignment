const request = require('supertest');
const { init } = require('../db');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// We'll spawn the real server to run tests against its handlers
let server;
let app;
let dbPath = require('path').join(__dirname, '..', 'store.db');

beforeAll(() => {
  // remove DB to get a fresh seed
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  // require the index after DB removed
  app = require('../index');
});

afterAll(() => {
  // noop - server exits when test process ends
});

test('GET /api/products returns seeded products', async () => {
  const res = await request('http://localhost:4000').get('/api/products');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThanOrEqual(5);
});

test('Full cart flow: add, get, update, delete, checkout', async () => {
  // add product 1 to cart
  let res = await request('http://localhost:4000').post('/api/cart').send({ productId: 1, qty: 2 });
  expect(res.statusCode).toBe(200);
  const cartId = res.body.cartId;

  // get cart
  res = await request('http://localhost:4000').get('/api/cart');
  expect(res.statusCode).toBe(200);
  expect(res.body.items.find(i => i.cartId === cartId)).toBeTruthy();

  // update qty
  res = await request('http://localhost:4000').post(`/api/cart/${cartId}`).send({ qty: 3 });
  expect(res.statusCode).toBe(200);

  // remove
  res = await request('http://localhost:4000').delete(`/api/cart/${cartId}`);
  expect(res.statusCode).toBe(200);

  // checkout with empty cart should return 400
  res = await request('http://localhost:4000').post('/api/checkout').send({ cartItems: [] });
  expect(res.statusCode).toBe(400);
});
