#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n📋 Supabase Migration Files Ready\n');
console.log('Please run these SQL files in your Supabase dashboard:\n');
console.log('1. Go to: https://supabase.com/dashboard/project/rcqnmjtesfxnwshkivdm/sql/new');
console.log('2. Run each migration file in order:\n');

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir).sort();

files.forEach((file, index) => {
  const filePath = path.join(migrationsDir, file);
  console.log(`   ${index + 1}. ${file}`);
  console.log(`      Path: ${filePath}\n`);
});

console.log('To view a migration file, run:');
console.log('  cat supabase/migrations/<filename>\n');
