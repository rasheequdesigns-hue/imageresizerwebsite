const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// Supabase REST Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hpmsmhqdgzikbgaprcad.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbXNtaHFkZ3ppa2JnYXByY2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NjYxMTgsImV4cCI6MjEwNDE0MjExOH0._IHf7Ydxwv8gJitn44JtftdS5uqP03-y3WMrqj_0C40';
// Service role key bypasses RLS for server-side operations.
// IMPORTANT: Add SUPABASE_SERVICE_KEY=<your-service-key> to .env.local for production.
// Find it at: Supabase Dashboard > Project Settings > API > service_role (secret)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || SUPABASE_ANON;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4'
};

// Helper: Parse incoming JSON or text request body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 20 * 1024 * 1024) req.destroy(); });
    req.on('end', () => {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          resolve({ raw: body });
        }
      } else {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

// Helper: Direct Supabase REST request
// useServiceKey=true bypasses RLS — use only for server-side admin operations
async function callSupabase(endpoint, method = 'GET', body = null, headers = {}, useServiceKey = true) {
  const targetUrl = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const key = useServiceKey ? SUPABASE_SERVICE_KEY : SUPABASE_ANON;
  const reqHeaders = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...headers
  };

  const response = await fetch(targetUrl, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  try {
    return { ok: response.ok, status: response.status, data: text ? JSON.parse(text) : null };
  } catch {
    return { ok: response.ok, status: response.status, data: text };
  }
}

// --- Automated Email & Statement UTR Parser Engine ---
function extractUtrAndAmountFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') return { utrs: [], amounts: [] };

  // 12-digit UTR regex patterns (UPI / IMPS / NEFT)
  const utrMatches = new Set();
  const utrPatterns = [
    /(?:UTR|Ref(?:erence)?|RRN|UPI(?:\/|\s*ref)?|Txn(?:\s*ID)?|Trans(?:action)?(?:\s*ID)?)[:\s\-\/]*([0-9]{12})/gi,
    /\b([0-9]{12})\b/g
  ];

  for (const pattern of utrPatterns) {
    let match;
    while ((match = pattern.exec(rawText)) !== null) {
      if (match[1] && /^\d{12}$/.test(match[1])) {
        utrMatches.add(match[1]);
      }
    }
  }

  // Amount extraction regex patterns (INR, Rs., Rs, ₹)
  const amountMatches = [];
  const amountPatterns = [
    /(?:Rs\.?|INR|₹)\s*([0-9]+(?:\.[0-9]{1,2})?)/gi,
    /(?:credited|received|paid|amount of)\s*(?:Rs\.?|INR|₹)?\s*([0-9]+(?:\.[0-9]{1,2})?)/gi
  ];

  for (const pattern of amountPatterns) {
    let match;
    while ((match = pattern.exec(rawText)) !== null) {
      const amt = parseFloat(match[1]);
      if (!isNaN(amt) && amt > 0) amountMatches.push(amt);
    }
  }

  return {
    utrs: Array.from(utrMatches),
    amounts: amountMatches
  };
}

// Helper: Activate User Plan from Payment
async function activateUserSubscription(paymentRecord) {
  const userId = paymentRecord.user_id;
  const planType = paymentRecord.plan_type || 'pro-monthly';

  // 1. Fetch target plan duration
  let durationDays = 30;
  try {
    const planRes = await callSupabase(`plans?id=eq.${encodeURIComponent(planType)}`);
    if (planRes.ok && planRes.data && planRes.data.length > 0) {
      durationDays = planRes.data[0].duration_days || 30;
    }
  } catch (e) {
    console.warn('[Activation] Could not fetch plan duration, using default 30 days:', e.message);
  }

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + durationDays);

  // 2. Mark payment as verified
  const payUpdate = await callSupabase(`payments?id=eq.${paymentRecord.id}`, 'PATCH', {
    is_verified: true,
    verified_at: new Date().toISOString()
  });

  // 3. Update user profile with active verified subscription
  const profUpdate = await callSupabase(`profiles?id=eq.${encodeURIComponent(userId)}`, 'PATCH', {
    current_plan: planType,
    plan_expiry: expiry.toISOString(),
    subscription_verified: true,
    updated_at: new Date().toISOString()
  });

  return {
    success: profUpdate.ok && payUpdate.ok,
    userId,
    planType,
    planExpiry: expiry.toISOString(),
    durationDays
  };
}

// --- Main HTTP Server Router ---
const server = http.createServer(async (req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // =========================================================================
  // BACKEND API ROUTES (/api/v1/*)
  // =========================================================================

  // 1. Webhook: Automated Email-to-UTR Verification (/api/v1/payments/verify-email)
  if (pathname === '/api/v1/payments/verify-email' && req.method === 'POST') {
    try {
      const payload = await parseRequestBody(req);
      const emailContent = payload.text || payload.body || payload.html || payload.message || payload.raw || JSON.stringify(payload);
      
      const { utrs, amounts } = extractUtrAndAmountFromText(emailContent);

      if (!utrs.length) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'No 12-digit UTR reference found in email content.', detectedAmounts: amounts }));
        return;
      }

      const results = [];
      for (const utr of utrs) {
        // Find unverified payment with this UTR
        const payRes = await callSupabase(`payments?utr_number=eq.${encodeURIComponent(utr)}&is_verified=eq.false`);
        if (payRes.ok && payRes.data && payRes.data.length > 0) {
          const payment = payRes.data[0];
          const activation = await activateUserSubscription(payment);
          results.push({ utr, matched: true, activated: activation.success, plan: payment.plan_type, userId: payment.user_id });
        } else {
          results.push({ utr, matched: false, note: 'No pending unverified payment found for this UTR.' });
        }
      }

      const anyActivated = results.some(r => r.activated);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        message: anyActivated ? 'Payment verified and subscription activated successfully!' : 'Email processed.',
        detectedUtrs: utrs,
        detectedAmounts: amounts,
        results
      }));
    } catch (err) {
      console.error('[API Webhook Error]:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 2. Admin: Batch Statement CSV / Text Uploader (/api/v1/admin/upload-statement)
  if (pathname === '/api/v1/admin/upload-statement' && req.method === 'POST') {
    try {
      const payload = await parseRequestBody(req);
      const statementContent = payload.csvData || payload.statement || payload.csv || payload.raw || payload.text || (typeof payload === 'string' ? payload : JSON.stringify(payload));
      const { utrs } = extractUtrAndAmountFromText(statementContent);

      if (!utrs.length) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'No 12-digit UTR numbers could be extracted from statement file.' }));
        return;
      }

      let activatedCount = 0;
      const matchedUtrs = [];

      for (const utr of utrs) {
        const payRes = await callSupabase(`payments?utr_number=eq.${encodeURIComponent(utr)}&is_verified=eq.false`);
        if (payRes.ok && payRes.data && payRes.data.length > 0) {
          for (const payment of payRes.data) {
            const activation = await activateUserSubscription(payment);
            if (activation.success) {
              activatedCount++;
              matchedUtrs.push({ utr, userId: payment.user_id, plan: payment.plan_type });
            }
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        scannedUtrCount: utrs.length,
        activatedCount,
        matchedUtrs,
        message: `Statement processed. ${activatedCount} subscription(s) activated out of ${utrs.length} scanned UTRs.`
      }));
    } catch (err) {
      console.error('[API Statement Upload Error]:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 3. Tool Execution Paywall Guard (/api/v1/tools/execute-guard)
  if (pathname === '/api/v1/tools/execute-guard' && req.method === 'POST') {
    try {
      const payload = await parseRequestBody(req);
      const { userId, toolId } = payload;

      if (!toolId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'toolId is required.' }));
        return;
      }

      // Check if feature is globally enabled
      const featRes = await callSupabase(`enabled_features?tool_id=eq.${encodeURIComponent(toolId)}`);
      if (featRes.ok && featRes.data && featRes.data.length > 0) {
        if (featRes.data[0].enabled === false) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'This tool has been globally disabled by the administrator.' }));
          return;
        }
      }

      // If user provided, check active subscription or admin status
      if (userId && userId !== 'guest') {
        const profRes = await callSupabase(`profiles?id=eq.${encodeURIComponent(userId)}`);
        if (profRes.ok && profRes.data && profRes.data.length > 0) {
          const prof = profRes.data[0];
          const isAdmin = prof.is_admin === true || prof.email === 'rasheequ.designs@gmail.com';
          const isVerified = prof.subscription_verified === true;
          const isNotExpired = prof.plan_expiry ? new Date(prof.plan_expiry) > new Date() : false;

          if (isAdmin || (isVerified && isNotExpired)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, allowed: true, isAdmin }));
            return;
          }
        }
      }

      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Active subscription required to access this tool.' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 4. Admin Stats (/api/v1/admin/stats)
  if (pathname === '/api/v1/admin/stats' && req.method === 'GET') {
    try {
      const [usersRes, paymentsRes, featuresRes] = await Promise.all([
        callSupabase('profiles?select=id,subscription_verified,is_admin,current_plan,plan_expiry'),
        callSupabase('payments?select=id,amount_paid,is_verified'),
        callSupabase('enabled_features?select=tool_id,enabled')
      ]);

      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];
      const features = Array.isArray(featuresRes.data) ? featuresRes.data : [];

      const totalUsers = users.length;
      const activeSubs = users.filter(u => u.subscription_verified && (!u.plan_expiry || new Date(u.plan_expiry) > new Date())).length;
      const pendingPayments = payments.filter(p => !p.is_verified).length;
      const verifiedPayments = payments.filter(p => p.is_verified);
      const totalRevenueINR = verifiedPayments.reduce((acc, p) => acc + (parseFloat(p.amount_paid) || 0), 0);
      const totalFeatures = features.length || 50;
      const enabledFeatures = features.filter(f => f.enabled !== false).length || 50;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        stats: { totalUsers, activeSubs, pendingPayments, totalRevenueINR, totalFeatures, enabledFeatures }
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 5. Admin: Get All Users (/api/v1/admin/users)
  if (pathname === '/api/v1/admin/users' && req.method === 'GET') {
    try {
      const usersRes = await callSupabase('profiles?select=*&order=created_at.desc');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, users: Array.isArray(usersRes.data) ? usersRes.data : [] }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 6. Admin: Get All Payments (/api/v1/admin/payments)
  if (pathname === '/api/v1/admin/payments' && req.method === 'GET') {
    try {
      const paymentsRes = await callSupabase('payments?select=*&order=payment_date.desc');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, payments: Array.isArray(paymentsRes.data) ? paymentsRes.data : [] }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 7. Admin: Approve Payment (/api/v1/admin/payments/approve)
  if (pathname === '/api/v1/admin/payments/approve' && req.method === 'POST') {
    try {
      const { paymentId, userId, planType } = await parseRequestBody(req);
      if (!paymentId || !userId || !planType) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'paymentId, userId, and planType are required.' }));
        return;
      }
      const activation = await activateUserSubscription({ id: paymentId, user_id: userId, plan_type: planType });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, activated: activation.success, planExpiry: activation.planExpiry }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 8. Admin: Reject Payment (/api/v1/admin/payments/reject)
  if (pathname === '/api/v1/admin/payments/reject' && req.method === 'POST') {
    try {
      const { paymentId } = await parseRequestBody(req);
      if (!paymentId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'paymentId is required.' }));
        return;
      }
      // Delete the rejected payment record so UTR can be resubmitted if needed
      await callSupabase(`payments?id=eq.${encodeURIComponent(paymentId)}`, 'DELETE');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, message: 'Payment rejected and removed.' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 9. Admin: Override User Plan (/api/v1/admin/users/set-plan)
  if (pathname === '/api/v1/admin/users/set-plan' && req.method === 'POST') {
    try {
      const { userId, planType, durationDays } = await parseRequestBody(req);
      if (!userId || !planType) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'userId and planType are required.' }));
        return;
      }
      const days = durationDays || 30;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + parseInt(days));
      const profUpdate = await callSupabase(`profiles?id=eq.${encodeURIComponent(userId)}`, 'PATCH', {
        current_plan: planType,
        plan_expiry: planType === 'free' ? null : expiry.toISOString(),
        subscription_verified: planType !== 'free',
        updated_at: new Date().toISOString()
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: profUpdate.ok, planExpiry: expiry.toISOString() }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }


  // =========================================================================
  // AI SCREENSHOT PAYMENT VERIFICATION (/api/verify-payment)
  // =========================================================================
  if (pathname === '/api/verify-payment' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { imageBase64, expectedUpiId, expectedAmount, sampleId } = body;
      const TARGET_UPI = (expectedUpiId || '9526569313@fam').toLowerCase().replace(/\s+/g,'').replace(/[\u200B-\u200D\uFEFF]/g,'');
      const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

      // ── Built-in test simulator ────────────────────────────────────────
      if (sampleId) {
        const samples = {
          'fampay-valid':    { isPaymentScreenshot:true, recipientUpiId:'9526569313@fam', recipientName:'FamPay User', amount:199, transactionId:'424589012345', paymentStatus:'SUCCESS', paymentApp:'FamPay', confidenceScore:97, rejectionReason:null },
          'phonepe-valid':   { isPaymentScreenshot:true, recipientUpiId:'9526569313@fam', recipientName:'StudioSuite PRO', amount:499, transactionId:'567890123456', paymentStatus:'SUCCESS', paymentApp:'PhonePe', confidenceScore:95, rejectionReason:null },
          'gpay-wrong-upi':  { isPaymentScreenshot:true, recipientUpiId:'wrongupi@okicici', recipientName:'Wrong Merchant', amount:499, transactionId:'678901234567', paymentStatus:'SUCCESS', paymentApp:'Google Pay', confidenceScore:93, rejectionReason:'Recipient UPI ID mismatch: detected wrongupi@okicici, expected 9526569313@fam' },
          'paytm-failed':    { isPaymentScreenshot:true, recipientUpiId:'9526569313@fam', recipientName:'StudioSuite PRO', amount:199, transactionId:'789012345678', paymentStatus:'FAILED', paymentApp:'Paytm', confidenceScore:91, rejectionReason:'Transaction failed by bank. Please retry payment.' },
        };
        const sample = samples[sampleId];
        if (!sample) {
          res.writeHead(400,{'Content-Type':'application/json'});
          res.end(JSON.stringify({ok:false,error:'Unknown sampleId'}));
          return;
        }
        const detectedUpi = (sample.recipientUpiId||'').toLowerCase().replace(/\s+/g,'').replace(/[\u200B-\u200D\uFEFF]/g,'');
        const upiMatch = detectedUpi === TARGET_UPI;
        const isSuccess = sample.paymentStatus === 'SUCCESS';
        const verified = sample.isPaymentScreenshot && upiMatch && isSuccess;
        let status = 'REJECTED', reason = sample.rejectionReason || '';
        if (verified) {
          status = 'VERIFIED';
        } else if (!sample.isPaymentScreenshot) {
          reason = 'Image does not appear to be a UPI payment receipt.';
        } else if (!upiMatch) {
          reason = reason || `Recipient UPI mismatch: found "${sample.recipientUpiId}", expected "${TARGET_UPI}"`;
        } else if (!isSuccess) {
          reason = reason || `Payment status is "${sample.paymentStatus}" — must be SUCCESS.`;
        }
        const token = verified ? crypto.createHash('sha256').update(`${sample.transactionId}:${Date.now()}:${TARGET_UPI}`).digest('hex').slice(0,32).toUpperCase() : null;
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify({ ok:true, status, token, extraction:{ ...sample, recipientUpiId:sample.recipientUpiId, upiMatch, amountMatch: expectedAmount ? Math.abs(sample.amount-(expectedAmount||0))<1 : null }, rejectionReason: reason||null }));
        return;
      }

      // ── Real Gemini AI verification ────────────────────────────────────
      if (!imageBase64) {
        res.writeHead(400,{'Content-Type':'application/json'});
        res.end(JSON.stringify({ok:false,error:'imageBase64 is required'}));
        return;
      }

      if (!GEMINI_KEY || GEMINI_KEY.includes('placeholder')) {
        res.writeHead(503,{'Content-Type':'application/json'});
        res.end(JSON.stringify({ok:false,error:'Gemini API key not configured. Add GEMINI_API_KEY to .env.local — get one free at https://aistudio.google.com/apikey'}));
        return;
      }

      // Detect image mime type from base64 header
      let mimeType = 'image/jpeg';
      if (imageBase64.startsWith('data:')) {
        const mimeMatch = imageBase64.match(/^data:([a-z/]+);base64,/);
        if (mimeMatch) mimeType = mimeMatch[1];
      }
      const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '');

      const prompt = `You are a UPI payment verification AI. Analyze this payment screenshot and extract the following fields exactly as a JSON object with NO markdown wrapping:
{
  "isPaymentScreenshot": <boolean - true only if this is a genuine UPI/bank payment receipt/confirmation screen>,
  "recipientUpiId": "<exact VPA string shown as recipient/payee, e.g. 9526569313@fam, or null>",
  "recipientName": "<payee or merchant name shown, or null>",
  "amount": <numeric INR amount paid, or null>,
  "transactionId": "<12-digit UTR/UPI Ref ID/Transaction ID, or null>",
  "paymentStatus": "<exactly one of: SUCCESS, FAILED, PENDING, UNKNOWN>",
  "paymentApp": "<app brand: FamPay, Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay, or Unknown>",
  "confidenceScore": <integer 0-100 representing your extraction confidence>,
  "rejectionReason": "<null if valid, otherwise detailed explanation why it cannot be verified>"
}

Rules:
- isPaymentScreenshot must be false for non-payment images (photos, documents, etc.)
- Extract the EXACT recipient UPI ID as shown — do not guess or infer
- transactionId must be exactly 12 digits if present
- paymentStatus should reflect the actual transaction outcome shown on screen
- confidenceScore should reflect how clearly readable the key fields are
Return ONLY the JSON object, no explanation.`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}`;
      const geminiBody = {
        contents: [{ parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Data } }
        ]}],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
      };

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody)
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        res.writeHead(502,{'Content-Type':'application/json'});
        res.end(JSON.stringify({ok:false,error:`Gemini API error ${geminiRes.status}: ${errText.slice(0,200)}`}));
        return;
      }

      const geminiData = await geminiRes.json();
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = rawText.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();

      let extraction;
      try { extraction = JSON.parse(cleanJson); }
      catch(e) {
        res.writeHead(502,{'Content-Type':'application/json'});
        res.end(JSON.stringify({ok:false,error:'AI returned invalid JSON. Response: '+rawText.slice(0,300)}));
        return;
      }

      // ── Verification logic ─────────────────────────────────────────────
      const detectedUpi = (extraction.recipientUpiId||'').toLowerCase().replace(/\s+/g,'').replace(/[\u200B-\u200D\uFEFF]/g,'');
      const upiMatch = detectedUpi === TARGET_UPI;
      const isSuccess = extraction.paymentStatus === 'SUCCESS';
      const verified = extraction.isPaymentScreenshot && upiMatch && isSuccess;

      let status = 'REJECTED';
      let rejectionReason = extraction.rejectionReason || null;

      if (verified) {
        status = 'VERIFIED';
        rejectionReason = null;
      } else if (!extraction.isPaymentScreenshot) {
        rejectionReason = 'The uploaded image does not appear to be a UPI payment receipt or confirmation screen.';
      } else if (!upiMatch) {
        rejectionReason = `Recipient UPI ID mismatch: detected "${extraction.recipientUpiId || 'not found'}", expected "${TARGET_UPI}". Please ensure you are paying to the correct UPI ID.`;
      } else if (!isSuccess) {
        rejectionReason = `Payment status is "${extraction.paymentStatus}" — only SUCCESS payments can be verified. Please retry the payment.`;
      }

      // Amount match check (advisory only, not blocking)
      const amountMatch = expectedAmount ? Math.abs((extraction.amount||0) - parseFloat(expectedAmount)) < 1 : null;

      // Generate secure token on success
      const token = verified
        ? crypto.createHash('sha256').update(`${extraction.transactionId||''}:${Date.now()}:${TARGET_UPI}:${extraction.amount||''}`).digest('hex').slice(0,32).toUpperCase()
        : null;

      res.writeHead(200,{'Content-Type':'application/json'});
      res.end(JSON.stringify({ ok:true, status, token, extraction:{ ...extraction, upiMatch, amountMatch }, rejectionReason }));

    } catch(err) {
      console.error('[/api/verify-payment error]', err);
      res.writeHead(500,{'Content-Type':'application/json'});
      res.end(JSON.stringify({ok:false,error:err.message}));
    }
    return;
  }
  // =========================================================================
  // STATIC FILE SERVING
  // =========================================================================
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  const safePath = path.normalize(path.join(ROOT, reqPath));

  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        const ext = path.extname(safePath);
        if (!ext || ext === '.html') {
          const indexPath = path.join(ROOT, 'index.html');
          fs.readFile(indexPath, (indexErr, indexData) => {
            if (indexErr) {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('404 Not Found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end(indexData);
            }
          });
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404 Not Found: ${pathname}`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    if (stats.isDirectory()) {
      const indexPath = path.join(safePath, 'index.html');
      fs.readFile(indexPath, (dirErr, dirData) => {
        if (dirErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(dirData);
        }
      });
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n=====================================================`);
  console.log(`🚀 StudioSuite 50 PRO Server + Paywall API Engine`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`📡 Webhook Receiver: http://localhost:${PORT}/api/v1/payments/verify-email`);
  console.log(`📊 Statement Uploader: http://localhost:${PORT}/api/v1/admin/upload-statement`);
  console.log(`=====================================================\n`);
});
