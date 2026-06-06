#!/usr/bin/env node
/**
 * Generate password hash for blog authentication
 * Usage: node scripts/generate-password-hash.js <password>
 */

const crypto = require('crypto');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/generate-password-hash.js <password>');
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');

console.log('\n=== Password Hash Generated ===\n');
console.log('Add these to your .env.local file:\n');
console.log(`BLOG_PASSWORD_HASH=${hash.toString('base64')}`);
console.log(`BLOG_PASSWORD_SALT=${salt.toString('base64')}`);
console.log(`JWT_SECRET=your-secret-key-here-change-this-in-production`);
console.log('\n');
