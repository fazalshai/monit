/**
 * Monit AED - Production Node.js Server for Render & Local Deployment
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Data storage file path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB template
const defaultDb = {
  budget: 5000,
  expenses: []
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB file, using defaults:', err);
    return defaultDb;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB file:', err);
    return false;
  }
}

// --- REST API ENDPOINTS ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Monit AED API', timestamp: new Date().toISOString() });
});

// GET all expenses and budget
app.get('/api/expenses', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    budget: db.budget || 5000,
    expenses: db.expenses || []
  });
});

// POST add a new expense
app.post('/api/expenses', (req, res) => {
  const { amount, item, category, date, paymentMethod, notes } = req.body;

  if (!amount || isNaN(amount) || !item) {
    return res.status(400).json({ error: 'Valid amount and item description are required' });
  }

  const db = readDb();
  const newTx = {
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    amount: parseFloat(amount),
    item: item.trim(),
    category: category || 'food',
    date: date || new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'Apple Pay',
    notes: notes ? notes.trim() : '',
    createdAt: Date.now()
  };

  db.expenses.unshift(newTx);
  writeDb(db);

  res.status(201).json({ success: true, expense: newTx });
});

// PUT update an existing expense
app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { amount, item, category, date, paymentMethod, notes } = req.body;

  const db = readDb();
  const index = db.expenses.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  db.expenses[index] = {
    ...db.expenses[index],
    amount: parseFloat(amount),
    item: item.trim(),
    category: category || 'food',
    date: date,
    paymentMethod: paymentMethod,
    notes: notes ? notes.trim() : ''
  };

  writeDb(db);
  res.json({ success: true, expense: db.expenses[index] });
});

// DELETE remove an expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initialLength = db.expenses.length;
  db.expenses = db.expenses.filter(t => t.id !== id);

  if (db.expenses.length === initialLength) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  writeDb(db);
  res.json({ success: true, message: 'Expense deleted successfully' });
});

// GET / POST budget
app.get('/api/budget', (req, res) => {
  const db = readDb();
  res.json({ budget: db.budget || 5000 });
});

app.post('/api/budget', (req, res) => {
  const { budget } = req.body;
  if (!budget || isNaN(budget) || budget <= 0) {
    return res.status(400).json({ error: 'Valid positive budget required' });
  }

  const db = readDb();
  db.budget = parseFloat(budget);
  writeDb(db);

  res.json({ success: true, budget: db.budget });
});

// POST clear all expenses
app.post('/api/expenses/clear', (req, res) => {
  const db = readDb();
  db.expenses = [];
  writeDb(db);
  res.json({ success: true, message: 'All expenses cleared' });
});

// Catch-all route to serve index.html for SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Monit AED server running on port ${PORT}`);
  console.log(`📱 Local URL: http://localhost:${PORT}`);
});
