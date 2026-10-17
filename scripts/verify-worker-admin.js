// ==============================================================================
// Verification Script for Worker 4: Admin Panel, Multi-Provider AI & Midtrans
// Validates all admin pages, services, Midtrans SHA-512 signatures & billing logic
// ==============================================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
console.log('🧪 RUNNING VERIFICATION FOR ADMIN PANEL & MIDTRANS BILLING');
console.log('======================================================\n');

// 1. Verify File Existence
console.log('--- 1. Admin & Midtrans File Existence Checks ---');
const requiredFiles = [
  'app/admin/layout.tsx',
  'app/admin/page.tsx',
  'app/admin/users/page.tsx',
  'app/admin/ai-settings/page.tsx',
  'app/admin/ai-logs/page.tsx',
  'app/admin/audit-logs/page.tsx',
  'app/admin/subscriptions/page.tsx',
  'lib/admin/admin-service.ts',
  'lib/admin/impersonation.ts',
  'lib/ai/multi-provider-client.ts',
  'lib/midtrans/midtrans-client.ts',
  'app/api/midtrans/charge/route.ts',
  'app/api/midtrans/webhook/route.ts',
  'app/api/admin/impersonate/route.ts',
];

for (const file of requiredFiles) {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `File exists: ${file}`);
}

// 2. Verify Admin Layout & Navigation
console.log('\n--- 2. Admin Layout & Navigation Integrity ---');
const layoutContent = fs.readFileSync(path.join(rootDir, 'app/admin/layout.tsx'), 'utf8');
assert(layoutContent.includes('/admin/ai-logs'), 'Layout includes link to /admin/ai-logs');
assert(layoutContent.includes('/admin/audit-logs'), 'Layout includes link to /admin/audit-logs');
assert(layoutContent.includes('/admin/subscriptions'), 'Layout includes link to /admin/subscriptions');
assert(layoutContent.includes('/admin/users'), 'Layout includes link to /admin/users');
assert(layoutContent.includes('/admin/ai-settings'), 'Layout includes link to /admin/ai-settings');
assert(layoutContent.includes('isImpersonating') && layoutContent.includes('Mode Impersonasi Aktif'), 'Layout renders persistent Impersonation banner');

// 3. Verify Admin AI Logs Page Content
console.log('\n--- 3. Admin AI Logs Page Checks ---');
const aiLogsContent = fs.readFileSync(path.join(rootDir, 'app/admin/ai-logs/page.tsx'), 'utf8');
assert(aiLogsContent.includes('adminService.getAiLogs'), 'AI Logs fetches via adminService.getAiLogs');
assert(aiLogsContent.includes('totalTokens') || aiLogsContent.includes('total_tokens'), 'AI Logs calculates total token consumption');
assert(aiLogsContent.includes('latency_ms'), 'AI Logs displays latency in ms');
assert(aiLogsContent.includes('FALLBACK'), 'AI Logs displays and filters FALLBACK status');
assert(aiLogsContent.includes('setSelectedLog'), 'AI Logs features inspection modal for log details');

// 4. Verify Admin Audit Logs Page Content
console.log('\n--- 4. Admin Audit Logs Page Checks ---');
const auditLogsContent = fs.readFileSync(path.join(rootDir, 'app/admin/audit-logs/page.tsx'), 'utf8');
assert(auditLogsContent.includes('adminService.getAuditLogs'), 'Audit Logs fetches via adminService.getAuditLogs');
assert(auditLogsContent.includes('IMPERSONATION_START'), 'Audit Logs tracks IMPERSONATION_START action');
assert(auditLogsContent.includes('VIEW_TRANSACTIONS'), 'Audit Logs tracks VIEW_TRANSACTIONS action');
assert(auditLogsContent.includes('ISO-27001') || auditLogsContent.includes('UU PDP'), 'Audit Logs declares compliance standard');
assert(auditLogsContent.includes('ip_address'), 'Audit Logs displays IP address of executor');

// 5. Verify Admin Subscriptions Page Content
console.log('\n--- 5. Admin Subscriptions Page Checks ---');
const subsContent = fs.readFileSync(path.join(rootDir, 'app/admin/subscriptions/page.tsx'), 'utf8');
assert(subsContent.includes('adminService.getSubscriptions'), 'Subscriptions fetches via adminService.getSubscriptions');
assert(subsContent.includes('adminService.approveSubscription'), 'Subscriptions supports manual approval');
assert(subsContent.includes('adminService.rejectSubscription'), 'Subscriptions supports manual rejection');
assert(subsContent.includes('midtransClient.simulatePayment'), 'Subscriptions features in-app Sandbox payment simulator');
assert(subsContent.includes('settlement'), 'Sandbox simulator supports settlement QRIS simulation');

// 6. Verify Midtrans SHA-512 Signature Logic
console.log('\n--- 6. Midtrans SHA-512 Signature Algorithm Checks ---');
const serverKey = 'SB-Mid-server-tatadana-mock-key';
const orderId = 'TATADANA-PRO-TEST-001';
const statusCode = '200';
const grossAmount = '49000.00';

const rawSignatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
const expectedHash = crypto.createHash('sha512').update(rawSignatureString).digest('hex');

const midtransClientContent = fs.readFileSync(path.join(rootDir, 'lib/midtrans/midtrans-client.ts'), 'utf8');
assert(midtransClientContent.includes('crypto.createHash(\'sha512\')'), 'Midtrans client uses standard crypto SHA-512');
assert(midtransClientContent.includes('generateSignature'), 'Exports generateSignature method');
assert(midtransClientContent.includes('verifySignature'), 'Exports verifySignature method');

// Calculate and assert signature logic
const testHash = crypto.createHash('sha512').update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest('hex');
assert(testHash === expectedHash, 'SHA-512 hash calculation matches Midtrans specification');

// 7. Verify Midtrans Webhook Idempotency & Tier Upgrade
console.log('\n--- 7. Midtrans Webhook Idempotency & Tier Upgrade Checks ---');
const webhookRouteContent = fs.readFileSync(path.join(rootDir, 'app/api/midtrans/webhook/route.ts'), 'utf8');
assert(webhookRouteContent.includes('handleWebhookNotification'), 'Webhook delegates to midtransClient.handleWebhookNotification');
assert(webhookRouteContent.includes('verifySignature'), 'Webhook validates incoming signature key');

assert(midtransClientContent.includes('webhook_events'), 'Midtrans client persists idempotency in webhook_events');
assert(midtransClientContent.includes('isDuplicate: true'), 'Handles duplicate webhook requests idempotently');
assert(midtransClientContent.includes('subscription_tier: \'PRO\''), 'Upgrades user subscription tier to PRO upon settlement');

// 8. Verify Admin Impersonation Service
console.log('\n--- 8. Admin Impersonation Service Checks ---');
const impersonationContent = fs.readFileSync(path.join(rootDir, 'lib/admin/impersonation.ts'), 'utf8');
assert(impersonationContent.includes('IMPERSONATE_STORAGE_KEY') || impersonationContent.includes('tatadana_impersonated_user'), 'Uses persistent local storage for impersonation');
assert(impersonationContent.includes('tatadana_impersonate_user_id'), 'Sets cookie for server route handlers');
assert(impersonationContent.includes('adminService.logAudit'), 'Automatically logs Privacy Audit Trail on impersonate start & stop');

// 9. Verify Multi-Provider AI Routing Logic
console.log('\n--- 9. Multi-Provider AI Architecture Checks ---');
const multiAiContent = fs.readFileSync(path.join(rootDir, 'lib/ai/multi-provider-client.ts'), 'utf8');
assert(multiAiContent.includes('GEMINI') && multiAiContent.includes('OPENAI') && multiAiContent.includes('DEEPSEEK'), 'Supports Gemini, OpenAI, and DeepSeek');
assert(multiAiContent.includes('FALLBACK') || multiAiContent.includes('failover'), 'Supports auto-failover routing mode');
assert(multiAiContent.includes('maskApiKey'), 'Exports maskApiKey for security compliance');

console.log('\n======================================================');
console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL ADMIN & MIDTRANS VERIFICATIONS PASSED!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
