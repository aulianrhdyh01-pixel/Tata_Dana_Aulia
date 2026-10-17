// ==============================================================================
// Verification Script for Worker 1: Database, Foundation, WIB, Types & Mock
// ==============================================================================

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('\n======================================================');
console.log('🧪 RUNNING VERIFICATION FOR WORKER 1');
console.log('======================================================\n');

// 1. Verify package.json & Configurations
console.log('--- 1. Base Configuration Files ---');
const packageJsonPath = path.join(rootDir, 'package.json');
assert(fs.existsSync(packageJsonPath), 'package.json exists');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const requiredDeps = [
  '@supabase/supabase-js',
  '@supabase/ssr',
  'lucide-react',
  'jspdf',
  'jspdf-autotable',
  'xlsx',
  'chart.js',
  'react-chartjs-2',
  'clsx',
  'tailwind-merge',
  'next',
  'react',
  'react-dom',
];
for (const dep of requiredDeps) {
  assert(pkg.dependencies && pkg.dependencies[dep], `package.json has dependency: ${dep}`);
}

assert(fs.existsSync(path.join(rootDir, 'tsconfig.json')), 'tsconfig.json exists');
assert(fs.existsSync(path.join(rootDir, 'tailwind.config.js')), 'tailwind.config.js exists');
assert(fs.existsSync(path.join(rootDir, 'postcss.config.js')), 'postcss.config.js exists');
assert(fs.existsSync(path.join(rootDir, 'next.config.js')), 'next.config.js exists');
assert(fs.existsSync(path.join(rootDir, '.env.example')), '.env.example exists');
assert(fs.existsSync(path.join(rootDir, '.env.local')), '.env.local exists');

// 2. Verify SQL Migration Schema
console.log('\n--- 2. Supabase Migration Schema ---');
const sqlPath = path.join(rootDir, 'supabase', 'migrations', '20261010_initial_schema.sql');
assert(fs.existsSync(sqlPath), 'Migration SQL file exists');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

const requiredTables = [
  'users',
  'wallets',
  'categories',
  'transactions',
  'transaction_items',
  'budgets',
  'reminders',
  'subscriptions',
  'ai_logs',
  'audit_logs',
  'webhook_events',
];

for (const tbl of requiredTables) {
  assert(
    sqlContent.includes(`CREATE TABLE IF NOT EXISTS public.${tbl}`) ||
    sqlContent.includes(`CREATE TABLE IF NOT EXISTS ${tbl}`),
    `Table '${tbl}' is defined in SQL migration`
  );
  assert(
    sqlContent.includes(`ALTER TABLE public.${tbl} ENABLE ROW LEVEL SECURITY`) ||
    sqlContent.includes(`ALTER TABLE ${tbl} ENABLE ROW LEVEL SECURITY`),
    `RLS enabled on table '${tbl}'`
  );
}

assert(sqlContent.includes('Asia/Jakarta'), 'Asia/Jakarta WIB timezone is used');
assert(sqlContent.includes('handle_transaction_balance_change'), 'Auto balance trigger function exists');
assert(sqlContent.includes('uq_source_event UNIQUE (source, event_id)'), 'Unique constraint on webhook_events exists');
assert(sqlContent.includes('Makanan & Minuman') && sqlContent.includes('Gaji & Upah'), 'Default categories are seeded');

// 3. Verify TypeScript Definitions
console.log('\n--- 3. Database TypeScript Types ---');
const typesPath = path.join(rootDir, 'types', 'database.ts');
assert(fs.existsSync(typesPath), 'types/database.ts exists');
const typesContent = fs.readFileSync(typesPath, 'utf8');
const requiredInterfaces = [
  'User',
  'Wallet',
  'Category',
  'Transaction',
  'TransactionItem',
  'Budget',
  'Reminder',
  'Subscription',
  'AILog',
  'AuditLog',
  'WebhookEvent',
  'Database',
];
for (const iface of requiredInterfaces) {
  assert(typesContent.includes(`interface ${iface}`), `TypeScript interface '${iface}' defined`);
}

// 4. Verify Date Utilities (WIB)
console.log('\n--- 4. Date Utilities & WIB (Asia/Jakarta) ---');
const dateUtilsPath = path.join(rootDir, 'lib', 'date-utils.ts');
assert(fs.existsSync(dateUtilsPath), 'lib/date-utils.ts exists');

// 5. Verify Supabase Clients & Mock Store
console.log('\n--- 5. Supabase Clients & Mock Store ---');
assert(fs.existsSync(path.join(rootDir, 'lib', 'supabase', 'seed-data.ts')), 'lib/supabase/seed-data.ts exists');
assert(fs.existsSync(path.join(rootDir, 'lib', 'supabase', 'mock-client.ts')), 'lib/supabase/mock-client.ts exists');
assert(fs.existsSync(path.join(rootDir, 'lib', 'supabase', 'client.ts')), 'lib/supabase/client.ts exists');
assert(fs.existsSync(path.join(rootDir, 'lib', 'supabase', 'server.ts')), 'lib/supabase/server.ts exists');

// 6. Verify Auth & App Layout
console.log('\n--- 6. Auth Service, Pages & Layout ---');
assert(fs.existsSync(path.join(rootDir, 'lib', 'auth', 'auth-service.ts')), 'lib/auth/auth-service.ts exists');
assert(fs.existsSync(path.join(rootDir, 'lib', 'auth', 'auth-context.tsx')), 'lib/auth/auth-context.tsx exists');
assert(fs.existsSync(path.join(rootDir, 'app', 'layout.tsx')), 'app/layout.tsx exists');
assert(fs.existsSync(path.join(rootDir, 'app', 'globals.css')), 'app/globals.css exists');
assert(fs.existsSync(path.join(rootDir, 'app', 'login', 'page.tsx')), 'app/login/page.tsx exists');
assert(fs.existsSync(path.join(rootDir, 'app', 'register', 'page.tsx')), 'app/register/page.tsx exists');
assert(fs.existsSync(path.join(rootDir, 'app', 'auth', 'callback', 'route.ts')), 'app/auth/callback/route.ts exists');

console.log('\n======================================================');
console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
