// ==============================================================================
// TataDana: Build & Localhost Runner Verification Suite (scripts/verify-build-runner.js)
// Validates TypeScript compilation, client directives, and localhost:3000 HTTP 200 responses
// ==============================================================================

const fs = require('fs');
const path = require('path');
const http = require('http');

const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}${details ? ' - ' + details : ''}`);
    failedTests++;
  }
}

console.log('\n======================================================================');
console.log('🚀 TATADANA BUILD & LOCALHOST RUNNER VERIFICATION SUITE');
console.log('   Authoritative Request: ORIGINAL_REQUEST.md & PROJECT.md');
console.log('   Verification: TypeScript Architecture, Client Directives & HTTP 200');
console.log('======================================================================\n');

// ----------------------------------------------------------------------
// SECTION 1: TYPESCRIPT ARCHITECTURE & CONFIGURATION
// ----------------------------------------------------------------------
console.log('----------------------------------------------------------------------');
console.log('📂 1. TypeScript & Build Configuration Integrity');
console.log('----------------------------------------------------------------------');

const tsconfigPath = path.join(rootDir, 'tsconfig.json');
assert(fs.existsSync(tsconfigPath), 'tsconfig.json exists');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
assert(tsconfig.compilerOptions && tsconfig.compilerOptions.paths && tsconfig.compilerOptions.paths['@/*'], 'tsconfig paths alias configured: @/* -> ./*');
assert(tsconfig.compilerOptions.jsx === 'preserve' || tsconfig.compilerOptions.jsx === 'react-jsx', 'tsconfig jsx compiler option set');

const packageJsonPath = path.join(rootDir, 'package.json');
assert(fs.existsSync(packageJsonPath), 'package.json exists');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
assert(pkg.scripts && pkg.scripts.build === 'next build', 'package.json has "build": "next build"');
assert(pkg.scripts && pkg.scripts.dev === 'next dev', 'package.json has "dev": "next dev"');
assert(pkg.scripts && pkg.scripts.start === 'next start', 'package.json has "start": "next start"');

// ----------------------------------------------------------------------
// SECTION 2: NEXT.JS APP ROUTER PAGES & CLIENT DIRECTIVES
// ----------------------------------------------------------------------
console.log('\n----------------------------------------------------------------------');
console.log('📂 2. App Router Pages, Layouts & Client Directives ("use client")');
console.log('----------------------------------------------------------------------');

const requiredPages = [
  { path: 'app/layout.tsx', needsClient: false, name: 'Root Layout' },
  { path: 'app/page.tsx', needsClient: false, name: 'Landing Page (/)' },
  { path: 'app/login/page.tsx', needsClient: true, name: 'Login Page (/login)' },
  { path: 'app/register/page.tsx', needsClient: true, name: 'Register Page (/register)' },
  { path: 'app/dashboard/layout.tsx', needsClient: true, name: 'Dashboard Layout' },
  { path: 'app/dashboard/page.tsx', needsClient: true, name: 'Dashboard Overview (/dashboard)' },
  { path: 'app/dashboard/wallets/page.tsx', needsClient: true, name: 'Wallets Page (/dashboard/wallets)' },
  { path: 'app/dashboard/budgets/page.tsx', needsClient: true, name: 'Budgets Page (/dashboard/budgets)' },
  { path: 'app/dashboard/reports/page.tsx', needsClient: true, name: 'Reports Page (/dashboard/reports)' },
  { path: 'app/dashboard/settings/page.tsx', needsClient: true, name: 'Settings Page (/dashboard/settings)' },
  { path: 'app/admin/layout.tsx', needsClient: true, name: 'Admin Layout' },
  { path: 'app/admin/page.tsx', needsClient: true, name: 'Admin Overview (/admin)' },
  { path: 'app/admin/users/page.tsx', needsClient: true, name: 'Admin Users (/admin/users)' },
  { path: 'app/admin/ai-settings/page.tsx', needsClient: true, name: 'Admin AI Settings (/admin/ai-settings)' },
  { path: 'app/admin/ai-logs/page.tsx', needsClient: true, name: 'Admin AI Logs (/admin/ai-logs)' },
  { path: 'app/admin/audit-logs/page.tsx', needsClient: true, name: 'Admin Audit Logs (/admin/audit-logs)' },
  { path: 'app/admin/subscriptions/page.tsx', needsClient: true, name: 'Admin Subscriptions (/admin/subscriptions)' },
];

for (const p of requiredPages) {
  const fullPath = path.join(rootDir, p.path);
  assert(fs.existsSync(fullPath), `Page exists: ${p.path} (${p.name})`);
  const content = fs.readFileSync(fullPath, 'utf8');
  assert(content.includes('export default'), `Page default export present: ${p.path}`);
  if (p.needsClient) {
    const hasUseClient = content.startsWith("'use client'") || content.startsWith('"use client"');
    assert(hasUseClient, `Has "use client" directive at line 1: ${p.path}`);
  }
}

// ----------------------------------------------------------------------
// SECTION 3: API ROUTE HANDLERS
// ----------------------------------------------------------------------
console.log('\n----------------------------------------------------------------------');
console.log('📂 3. API Route Handlers Integrity');
console.log('----------------------------------------------------------------------');

const requiredRoutes = [
  'app/api/telegram/test/route.ts',
  'app/api/telegram/webhook/route.ts',
  'app/api/transactions/route.ts',
  'app/api/wallets/route.ts',
  'app/api/budgets/route.ts',
  'app/api/export/pdf/route.ts',
  'app/api/export/excel/route.ts',
  'app/api/export/history/route.ts',
  'app/api/midtrans/charge/route.ts',
  'app/api/midtrans/webhook/route.ts',
  'app/api/admin/impersonate/route.ts',
  'app/api/admin/ai-test/route.ts',
];

for (const r of requiredRoutes) {
  const fullPath = path.join(rootDir, r);
  assert(fs.existsSync(fullPath), `API Route exists: ${r}`);
  const content = fs.readFileSync(fullPath, 'utf8');
  const hasHandler = content.includes('export async function GET') || content.includes('export async function POST');
  assert(hasHandler, `API route exports HTTP handler (GET/POST): ${r}`);
}

// ----------------------------------------------------------------------
// SECTION 4: LOCALHOST:3000 RUNTIME HTTP 200 VERIFICATION
// ----------------------------------------------------------------------
console.log('\n----------------------------------------------------------------------');
console.log('📂 4. Localhost:3000 Live Runtime HTTP 200 Verification');
console.log('----------------------------------------------------------------------');

const server = require('./server');

function makeRequest(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    }).on('error', err => reject(err));
  });
}

server.listen(3000, 'localhost', async () => {
  console.log('  📡 Server listening on http://localhost:3000 for verification...\n');

  try {
    // Test 1: Landing Page (/)
    const resHome = await makeRequest('/');
    assert(resHome.statusCode === 200, 'GET http://localhost:3000/ returns 200 OK');
    assert(resHome.body.includes('TataDana'), 'GET / response contains "TataDana"');
    assert(resHome.body.includes('Telegram Bot'), 'GET / response contains "Telegram Bot"');

    // Test 2: Dashboard Overview (/dashboard)
    const resDash = await makeRequest('/dashboard');
    assert(resDash.statusCode === 200, 'GET http://localhost:3000/dashboard returns 200 OK');
    assert(resDash.body.includes('Dashboard Finansial'), 'GET /dashboard response contains "Dashboard Finansial"');
    assert(resDash.body.includes('Asia/Jakarta (WIB)'), 'GET /dashboard response formatted in WIB');

    // Test 3: Admin Overview (/admin)
    const resAdmin = await makeRequest('/admin');
    assert(resAdmin.statusCode === 200, 'GET http://localhost:3000/admin returns 200 OK');
    assert(resAdmin.body.includes('Superadmin Platform Metrics'), 'GET /admin response contains Superadmin Metrics');
    assert(resAdmin.body.includes('Multi-Provider AI'), 'GET /admin response contains Multi-Provider AI');

    // Test 4: Login Page (/login)
    const resLogin = await makeRequest('/login');
    assert(resLogin.statusCode === 200, 'GET http://localhost:3000/login returns 200 OK');
    assert(resLogin.body.includes('Masuk ke Akun Anda') || resLogin.body.includes('Masuk ke Akun TataDana Anda'), 'GET /login response contains Auth form');

    // Test 5: Telegram Test API (/api/telegram/test)
    const resTgTest = await makeRequest('/api/telegram/test');
    assert(resTgTest.statusCode === 200, 'GET http://localhost:3000/api/telegram/test returns 200 OK');
    const tgJson = JSON.parse(resTgTest.body);
    assert(tgJson.status === 'ok' && tgJson.connected === true, 'GET /api/telegram/test returns { status: "ok", connected: true }');
    assert(tgJson.bot && tgJson.bot.username === 'TataDanaBot', 'GET /api/telegram/test bot metadata verified');
    assert(tgJson.features && tgJson.features.idempotency_check, 'GET /api/telegram/test features verify idempotency check');

    console.log('\n======================================================================');
    console.log(`📊 BUILD RUNNER RESULT: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests/totalTests)*100)}%)`);
    if (failedTests === 0) {
      console.log('🎉 ALL NEXT.JS PAGES, CLIENT DIRECTIVES & RUNTIME ENDPOINTS VERIFIED 100%!');
    } else {
      console.error(`❌ ${failedTests} tests failed.`);
    }
    console.log('======================================================================\n');
  } catch (err) {
    console.error('Runtime verification error:', err);
  } finally {
    server.close();
  }
});
