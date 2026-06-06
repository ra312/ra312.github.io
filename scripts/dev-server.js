/**
 * Express dev server for testing blog API locally
 * Usage: node scripts/dev-server.js
 */

require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json());
app.use(express.text());
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.post('/api/auth-password', require('../api/auth-password.js'));
app.post('/api/publish', require('../api/publish.js'));

// Error handler (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n✨ Blog Dev Server running at http://localhost:${PORT}`);
  console.log(`\n📝 Editor: http://localhost:${PORT}/blog/editor.html`);
  console.log(`📚 Blog: http://localhost:${PORT}/blog/`);
  console.log(`\n⚙️  API Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth-password`);
  console.log(`   POST http://localhost:${PORT}/api/publish`);
  console.log(`\n🔐 Test credentials:`);
  console.log(`   Password: testpassword`);
  console.log(`\n📝 Quick test:`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/auth-password \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"password":"testpassword"}' | jq .`);
  console.log(`\n`);
});
