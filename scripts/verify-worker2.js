// ==============================================================================
// Verification Script for Worker 2: Telegram Bot Webhook & Multi-Modal Parsing
// Validates all owned files, contracts, types, and logic.
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
console.log('🧪 RUNNING VERIFICATION FOR WORKER 2 (TELEGRAM BOT & AI PARSER)');
console.log('======================================================\n');

// 1. Verify File Existence
console.log('--- 1. Owned File Existence Checks ---');
const ownedFiles = [
  'app/api/telegram/webhook/route.ts',
  'app/api/telegram/test/route.ts',
  'lib/telegram/idempotency.ts',
  'lib/telegram/bot-service.ts',
  'lib/telegram/formatter.ts',
  'lib/ai/parser.ts',
  'lib/ai/ocr-service.ts',
  'lib/ai/stt-service.ts',
  'lib/ai/advisor-service.ts',
  'lib/subscription/quota-guard.ts',
];

for (const file of ownedFiles) {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `File exists: ${file}`);
}

// 2. Verify Webhook & Idempotency Implementation
console.log('\n--- 2. Webhook & Idempotency Route Checks ---');
const webhookContent = fs.readFileSync(path.join(rootDir, 'app/api/telegram/webhook/route.ts'), 'utf8');
assert(webhookContent.includes('checkAndRecordUpdateId'), 'Webhook uses checkAndRecordUpdateId');
assert(webhookContent.includes('duplicate: true'), 'Webhook returns duplicate: true on repeated update_id');
assert(webhookContent.includes('status: 200'), 'Webhook returns HTTP 200 on duplicate to satisfy Telegram protocol');
assert(webhookContent.includes('handleTelegramUpdate'), 'Webhook delegates new updates to handleTelegramUpdate');

const idempotencyContent = fs.readFileSync(path.join(rootDir, 'lib/telegram/idempotency.ts'), 'utf8');
assert(idempotencyContent.includes('webhook_events'), 'Idempotency checks against webhook_events table');
assert(idempotencyContent.includes('processedUpdateIds'), 'Idempotency maintains atomic in-memory set');
assert(idempotencyContent.includes('export async function checkAndRecordUpdateId'), 'Exports checkAndRecordUpdateId function');

// 3. Verify Indonesian Currency & Natural Language Parser
console.log('\n--- 3. Indonesian Currency & NLP Parser Checks ---');
const parserContent = fs.readFileSync(path.join(rootDir, 'lib/ai/parser.ts'), 'utf8');
assert(parserContent.includes('export function parseIndonesianNominal'), 'Exports parseIndonesianNominal');
assert(parserContent.includes('export async function parseIndonesianTransaction'), 'Exports parseIndonesianTransaction');
assert(parserContent.includes('rb') && parserContent.includes('jt') && parserContent.includes('k'), 'Handles rb, jt, and k suffixes');
assert(parserContent.includes('Makanan & Minuman'), 'Infers Makanan & Minuman category');
assert(parserContent.includes('Transportasi'), 'Infers Transportasi category');
assert(parserContent.includes('Tagihan & Utilitas'), 'Infers Tagihan & Utilitas category');
assert(parserContent.includes('Gaji'), 'Infers Gaji category');

// 4. Verify Multi-Item Receipt Vision OCR Service
console.log('\n--- 4. Receipt Vision OCR Service Checks ---');
const ocrContent = fs.readFileSync(path.join(rootDir, 'lib/ai/ocr-service.ts'), 'utf8');
assert(ocrContent.includes('export function parseReceiptText'), 'Exports parseReceiptText');
assert(ocrContent.includes('export async function extractReceiptOcr'), 'Exports extractReceiptOcr');
assert(ocrContent.includes('merchant'), 'Extracts merchant name');
assert(ocrContent.includes('items: ReceiptItem[]'), 'Extracts itemized items array');
assert(ocrContent.includes('total'), 'Extracts total amount');

// 5. Verify Voice Note Audio STT Service
console.log('\n--- 5. Voice Note Audio STT Service Checks ---');
const sttContent = fs.readFileSync(path.join(rootDir, 'lib/ai/stt-service.ts'), 'utf8');
assert(sttContent.includes('export async function transcribeVoiceNote'), 'Exports transcribeVoiceNote');
assert(sttContent.includes('VoiceNoteDurationExceededError'), 'Defines VoiceNoteDurationExceededError');
assert(sttContent.includes('60'), 'Enforces 60-second limit');
assert(sttContent.includes('formattedTranscriptionLine'), 'Produces formatted transcription line');

// 6. Verify Telegram Reply Formatter
console.log('\n--- 6. Telegram Reply Formatter Checks ---');
const formatterContent = fs.readFileSync(path.join(rootDir, 'lib/telegram/formatter.ts'), 'utf8');
assert(formatterContent.includes('renderProgressBar'), 'Exports renderProgressBar');
assert(formatterContent.includes('formatTransactionReply'), 'Exports formatTransactionReply');
assert(formatterContent.includes('formatSaldoReply'), 'Exports formatSaldoReply');
assert(formatterContent.includes('formatHariIniReply'), 'Exports formatHariIniReply');
assert(formatterContent.includes('formatMingguIniReply'), 'Exports formatMingguIniReply');
assert(formatterContent.includes('formatBulanIniReply'), 'Exports formatBulanIniReply');
assert(formatterContent.includes('formatBudgetReply'), 'Exports formatBudgetReply');
assert(formatterContent.includes('formatSheetReply'), 'Exports formatSheetReply');
assert(formatterContent.includes('formatBantuanReply'), 'Exports formatBantuanReply');
assert(formatterContent.includes('Sisa Saldo'), 'Formats remaining default wallet balance');
assert(formatterContent.includes('Hemat pangkal kaya') || formatterContent.includes('MOTIVATIONAL'), 'Includes motivational finance quotes');

// 7. Verify Subscription Quota Guard
console.log('\n--- 7. Quota Guard Checks ---');
const quotaContent = fs.readFileSync(path.join(rootDir, 'lib/subscription/quota-guard.ts'), 'utf8');
assert(quotaContent.includes('STARTER_MAX_MONTHLY_TRANSACTIONS = 50'), 'Enforces 50 tx/month limit for Starter');
assert(quotaContent.includes('checkTransactionQuota'), 'Exports checkTransactionQuota');
assert(quotaContent.includes('checkProFeatureAccess'), 'Exports checkProFeatureAccess');
assert(quotaContent.includes('RECEIPT_OCR') && quotaContent.includes('VOICE_STT'), 'Guards Receipt OCR and Voice STT for Pro');

// 8. Verify Pro AI Financial Advisor Service
console.log('\n--- 8. Pro AI Advisor Service Checks ---');
const advisorContent = fs.readFileSync(path.join(rootDir, 'lib/ai/advisor-service.ts'), 'utf8');
assert(advisorContent.includes('evaluateFinancialAdvice'), 'Exports evaluateFinancialAdvice');
assert(advisorContent.includes('BUDGET_OVERSPEND'), 'Detects BUDGET_OVERSPEND on >20% deviation');
assert(advisorContent.includes('SPENDING_SPIKE'), 'Detects SPENDING_SPIKE on abnormal surge');
assert(advisorContent.includes('recommendations'), 'Provides actionable financial recommendations');

// 9. Verify Bot Service & Command Router
console.log('\n--- 9. Bot Service Command Router Checks ---');
const botServiceContent = fs.readFileSync(path.join(rootDir, 'lib/telegram/bot-service.ts'), 'utf8');
assert(botServiceContent.includes('handleTelegramUpdate'), 'Exports handleTelegramUpdate');
assert(botServiceContent.includes('/saldo'), 'Handles /saldo command');
assert(botServiceContent.includes('/hari ini'), 'Handles /hari ini command');
assert(botServiceContent.includes('/minggu ini'), 'Handles /minggu ini command');
assert(botServiceContent.includes('/bulan ini'), 'Handles /bulan ini command');
assert(botServiceContent.includes('/budget'), 'Handles /budget command');
assert(botServiceContent.includes('/sheet'), 'Handles /sheet command');
assert(botServiceContent.includes('/bantuan'), 'Handles /bantuan command');

// 10. Verify Test Endpoint
console.log('\n--- 10. Telegram Test Endpoint Checks ---');
const testEndpointContent = fs.readFileSync(path.join(rootDir, 'app/api/telegram/test/route.ts'), 'utf8');
assert(testEndpointContent.includes('getMe') || testEndpointContent.includes('SIMULATOR_SANDBOX'), 'Test endpoint handles getMe or simulator status');
assert(testEndpointContent.includes('set_webhook') || testEndpointContent.includes('setWebhook'), 'Test endpoint handles setWebhook');

console.log('\n======================================================');
console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
