/**
 * StudioSuite PRO -- UPI Screenshot Auto-Verification System
 * Target UPI: 9526569313@fam | 3-Step Flow: Pay & Upload -> AI Verification -> Unlock
 */
(function() {
'use strict';

const TARGET_UPI = '9526569313@fam';
const VERIFY_API = '/api/verify-payment';
const AUDIT_KEY  = 'studiosuite_payment_audit';
const PRESETS    = [199, 499, 999];

function getAuditLog() { try { return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]'); } catch { return []; } }
function appendAudit(e) { const l=getAuditLog(); l.unshift({...e,ts:new Date().toISOString()}); localStorage.setItem(AUDIT_KEY,JSON.stringify(l.slice(0,50))); }

function generateSampleReceipt(sid) {
  const c=document.createElement('canvas'); c.width=400; c.height=620;
  const ctx=c.getContext('2d');
  const cfgs={
    'fampay-valid':{bg:'#6C63FF',app:'FamPay',upi:TARGET_UPI,name:'StudioSuite PRO',amt:199,txn:'424589012345',st:'Payment Successful',sc:'#22c55e'},
    'phonepe-valid':{bg:'#5f259f',app:'PhonePe',upi:TARGET_UPI,name:'StudioSuite PRO',amt:499,txn:'567890123456',st:'Payment Successful',sc:'#22c55e'},
    'gpay-wrong-upi':{bg:'#4285f4',app:'Google Pay',upi:'wrongupi@okicici',name:'Wrong Merchant',amt:499,txn:'678901234567',st:'Payment Successful',sc:'#22c55e'},
    'paytm-failed':{bg:'#002970',app:'Paytm',upi:TARGET_UPI,name:'StudioSuite PRO',amt:199,txn:'789012345678',st:'Payment Failed',sc:'#ef4444'},
  };
  const cf=cfgs[sid]||cfgs['fampay-valid'];
  ctx.fillStyle=cf.bg; ctx.fillRect(0,0,400,120);
  ctx.fillStyle='#fff'; ctx.font='bold 22px sans-serif'; ctx.textAlign='center';
  ctx.fillText(cf.app,200,55); ctx.font='13px sans-serif'; ctx.fillText('Payment Receipt',200,82);
  ctx.fillStyle='#fff'; ctx.fillRect(0,120,400,500);
  ctx.fillStyle=cf.sc; ctx.beginPath(); ctx.arc(200,175,28,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='bold 30px sans-serif'; ctx.fillText(cf.st.includes('Failed')?'X':'OK',200,185);
  ctx.fillStyle=cf.sc; ctx.font='bold 16px sans-serif'; ctx.fillText(cf.st,200,225);
  ctx.fillStyle='#1e293b'; ctx.font='bold 34px sans-serif'; ctx.fillText('Rs.'+cf.amt+'.00',200,275);
  const rows=[['To',cf.name],['UPI ID',cf.upi],['UTR / Ref',cf.txn],['Date',new Date().toLocaleDateString('en-IN')],['Time',new Date().toLocaleTimeString('en-IN')]];
  ctx.textAlign='left'; ctx.font='12px sans-serif';
  rows.forEach(([k,v],i)=>{
    const y=315+i*48;
    ctx.fillStyle='#94a3b8'; ctx.fillText(k,30,y);
    ctx.fillStyle='#1e293b'; ctx.font='bold 13px sans-serif'; ctx.fillText(v,30,y+18); ctx.font='12px sans-serif';
    if(i<rows.length-1){ctx.strokeStyle='#f1f5f9';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(30,y+34);ctx.lineTo(370,y+34);ctx.stroke();}
  });
  return c.toDataURL('image/png');
}
function injectStyles() {
  if (document.getElementById('upi-v-css')) return;
  const s = document.createElement('style'); s.id = 'upi-v-css';
  s.textContent = `
.upi-verifier-root{font-family:system-ui,-apple-system,sans-serif;color:#1e293b;max-width:1020px;margin:0 auto;padding:1.5rem 1rem}
.upi-steps{display:flex;align-items:center;justify-content:center;margin-bottom:2rem}
.upi-step{display:flex;flex-direction:column;align-items:center;gap:4px}
.upi-step span{width:32px;height:32px;border-radius:50%;background:#e2e8f0;color:#64748b;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;transition:all .3s}
.upi-step label{font-size:10px;font-weight:600;color:#94a3b8;white-space:nowrap}
.upi-step.active span{background:#6366f1;color:#fff;box-shadow:0 0 0 4px #e0e7ff}
.upi-step.done span{background:#22c55e;color:#fff}
.upi-step-line{flex:1;height:2px;background:#e2e8f0;margin:0 8px 18px;min-width:40px}
.upi-panel{animation:uvFadeIn .3s ease}
@keyframes uvFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.upi-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
@media(max-width:700px){.upi-grid{grid-template-columns:1fr}}
.upi-card{background:#fff;border:1.5px solid #e2e8f0;border-radius:18px;padding:1.5rem;box-shadow:0 2px 16px rgba(0,0,0,.06)}
.upi-card h3{font-size:15px;font-weight:800;color:#1e293b;margin:0 0 6px;display:flex;align-items:center;gap:8px}
.upi-card h3 i{color:#6366f1}
.upi-sub{font-size:12px;color:#64748b;margin:0 0 14px}
.upi-amount-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.upi-preset-btn{padding:6px 14px;border:2px solid #e2e8f0;border-radius:10px;background:#f8fafc;font-weight:700;font-size:13px;cursor:pointer;transition:all .15s}
.upi-preset-btn:hover,.upi-preset-btn.active{border-color:#6366f1;background:#eef2ff;color:#4f46e5}
.upi-amount-input{flex:1;min-width:80px;padding:6px 10px;border:2px solid #e2e8f0;border-radius:10px;font-size:13px;font-weight:600}
.upi-amount-input:focus{outline:none;border-color:#6366f1}
.upi-qr-box{text-align:center;margin:12px 0}
.upi-qr-container{display:inline-flex;align-items:center;justify-content:center;background:#fff;border:2px solid #e2e8f0;border-radius:14px;padding:10px;width:160px;height:160px;box-shadow:0 4px 16px rgba(99,102,241,.1)}
.upi-qr-container img{width:140px;height:140px;object-fit:contain;border-radius:8px}
.upi-qr-label{font-size:11px;color:#94a3b8;margin-top:6px}
.upi-id-text{font-family:monospace;font-size:13px;color:#4f46e5;background:#eef2ff;padding:2px 8px;border-radius:6px}
.upi-copy-btn{background:none;border:none;cursor:pointer;color:#6366f1;padding:2px 6px;border-radius:6px;transition:all .15s;font-size:13px}
.upi-copy-btn:hover{background:#eef2ff}
.upi-copy-btn.copied{color:#22c55e}
.upi-deeplink-btn{display:block;text-align:center;background:#6366f1;color:#fff;padding:9px;border-radius:12px;font-weight:700;font-size:13px;text-decoration:none;margin:10px 0;transition:background .15s}
.upi-deeplink-btn:hover{background:#4f46e5}
.upi-supported{font-size:10px;color:#94a3b8;text-align:center;margin:4px 0 0}
.upi-dropzone{border:2.5px dashed #cbd5e1;border-radius:14px;padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:all .2s;min-height:140px;display:flex;align-items:center;justify-content:center;background:#fafbff;margin-bottom:12px}
.upi-dropzone.drag-over{border-color:#6366f1;background:#eef2ff}
.upi-drop-icon{font-size:2.5rem;color:#c7d2fe;margin-bottom:8px}
.upi-drop-title{font-size:14px;font-weight:600;color:#475569}
.upi-drop-hint{font-size:11px;color:#94a3b8;margin-top:4px}
.upi-link{color:#6366f1;font-weight:700}
kbd{background:#f1f5f9;border:1px solid #cbd5e1;border-radius:4px;padding:1px 5px;font-size:11px;font-family:monospace}
.upi-preview-wrap{position:relative;display:inline-block;max-width:220px}
.upi-preview-img{max-width:100%;max-height:200px;border-radius:10px;cursor:zoom-in;box-shadow:0 4px 16px rgba(0,0,0,.1)}
.upi-preview-overlay{position:absolute;top:6px;right:6px}
.upi-preview-overlay button{background:rgba(0,0,0,.5);color:#fff;border:none;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px}
.upi-change-btn{display:block;margin-top:8px;background:none;border:1.5px solid #cbd5e1;border-radius:8px;padding:5px 14px;font-size:12px;font-weight:600;color:#64748b;cursor:pointer;transition:all .15s}
.upi-change-btn:hover{border-color:#6366f1;color:#4f46e5}
.upi-samples-box{background:#f8fafc;border:1.5px solid #f1f5f9;border-radius:12px;padding:12px;margin-bottom:14px}
.upi-samples-label{font-size:11px;font-weight:700;color:#475569;margin:0 0 8px;display:flex;align-items:center;gap:6px}
.upi-samples-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.upi-sample-btn{padding:7px 10px;border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid;display:flex;align-items:center;gap:5px;transition:all .15s}
.upi-sample-ok{background:#f0fdf4;border-color:#86efac;color:#166534}
.upi-sample-ok:hover{background:#dcfce7}
.upi-sample-bad{background:#fff7ed;border-color:#fdba74;color:#9a3412}
.upi-sample-bad:hover{background:#ffedd5}
.upi-verify-btn{width:100%;padding:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:14px;font-size:15px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;box-shadow:0 4px 16px rgba(99,102,241,.3)}
.upi-verify-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,.4)}
.upi-verify-btn:disabled{opacity:.6;transform:none;cursor:not-allowed}
.upi-audit-toggle{display:flex;align-items:center;gap:8px;margin-top:1.5rem;font-size:13px;font-weight:700;color:#64748b;cursor:pointer;padding:8px 0}
.upi-audit-toggle:hover{color:#4f46e5}
.upi-audit-badge{background:#6366f1;color:#fff;border-radius:20px;padding:1px 8px;font-size:11px;font-weight:800}
.upi-audit-drawer{background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;padding:1rem;margin-top:8px;max-height:300px;overflow-y:auto}
.upi-audit-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px}
.upi-audit-row:last-child{border:none}
.upi-audit-badge-v{background:#dcfce7;color:#166534;border-radius:6px;padding:2px 8px;font-weight:700;font-size:10px}
.upi-audit-badge-r{background:#fee2e2;color:#991b1b;border-radius:6px;padding:2px 8px;font-weight:700;font-size:10px}
.upi-verify-layout{display:grid;grid-template-columns:1fr 1.2fr;gap:1.25rem;align-items:start}
@media(max-width:700px){.upi-verify-layout{grid-template-columns:1fr}}
.upi-scan-box{position:relative;border-radius:16px;overflow:hidden;background:#0f172a;max-height:440px;display:flex;align-items:center;justify-content:center}
.upi-scan-img{max-width:100%;max-height:440px;object-fit:contain;display:block;opacity:.85}
.upi-laser{position:absolute;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#22d3ee,transparent);box-shadow:0 0 12px #22d3ee;animation:laserScan 2s ease-in-out infinite}
@keyframes laserScan{0%{top:5%}50%{top:92%}100%{top:5%}}
.upi-scan-corner{position:absolute;width:24px;height:24px}
.upi-tl{top:8px;left:8px;border-top:3px solid #22d3ee;border-left:3px solid #22d3ee;border-radius:4px 0 0 0}
.upi-tr{top:8px;right:8px;border-top:3px solid #22d3ee;border-right:3px solid #22d3ee;border-radius:0 4px 0 0}
.upi-bl{bottom:8px;left:8px;border-bottom:3px solid #22d3ee;border-left:3px solid #22d3ee;border-radius:0 0 0 4px}
.upi-br{bottom:8px;right:8px;border-bottom:3px solid #22d3ee;border-right:3px solid #22d3ee;border-radius:0 0 4px 0}
.upi-stages-col{background:#fff;border:1.5px solid #e2e8f0;border-radius:18px;padding:1.25rem}
.upi-stages-title{font-size:15px;font-weight:800;margin:0 0 14px;display:flex;align-items:center;gap:8px}
.upi-stages-title i{color:#6366f1}
.upi-stages-list{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
.upi-stage{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;color:#94a3b8;transition:all .3s}
.upi-stage.active{color:#6366f1}
.upi-stage.done{color:#22c55e}
.upi-stage-icon{width:22px;text-align:center;font-size:14px;flex-shrink:0}
.upi-result-banner{border-radius:12px;padding:12px 14px;font-size:13px;font-weight:700;margin-bottom:12px;display:flex;align-items:flex-start;gap:8px}
.upi-result-banner.verified{background:#dcfce7;color:#15803d;border:1.5px solid #86efac}
.upi-result-banner.rejected{background:#fee2e2;color:#991b1b;border:1.5px solid #fca5a5}
.upi-result-table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px}
.upi-result-table tr:not(:last-child) td{border-bottom:1px solid #f1f5f9}
.upi-result-table td{padding:7px 4px;vertical-align:top}
.upi-result-table td:first-child{color:#94a3b8;font-weight:600;width:40%;white-space:nowrap}
.upi-result-table td:last-child{font-weight:700;color:#1e293b;word-break:break-all}
.upi-result-actions{display:flex;flex-direction:column;gap:8px}
.upi-countdown-bar{height:4px;background:#dcfce7;border-radius:2px;overflow:hidden;margin:6px 0}
.upi-countdown-fill{height:100%;background:#22c55e;transition:width .1s linear}
.upi-unlocked-box{text-align:center;background:#fff;border:1.5px solid #e2e8f0;border-radius:20px;padding:2.5rem 2rem;max-width:520px;margin:0 auto;position:relative;overflow:hidden}
.upi-unlock-icon{font-size:3.5rem;color:#22c55e;margin-bottom:12px}
.upi-unlock-title{font-size:26px;font-weight:900;color:#1e293b;margin:0 0 8px}
.upi-unlock-sub{font-size:14px;color:#64748b;margin:0 0 24px}
.upi-token-box{background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;padding:14px;margin-bottom:24px}
.upi-token-label{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin:0 0 6px}
.upi-token-val{font-family:monospace;font-size:13px;font-weight:800;color:#4f46e5;word-break:break-all;letter-spacing:2px}
.upi-unlock-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}
.upi-confetti-area{position:absolute;top:0;left:0;right:0;height:120px;overflow:hidden;pointer-events:none}
.upi-confetti-piece{position:absolute;width:8px;height:8px;border-radius:50%;animation:confettiFall 2s ease-in forwards}
@keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(120px) rotate(720deg);opacity:0}}
.upi-btn-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;padding:10px 20px;font-weight:800;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .15s}
.upi-btn-primary:hover{filter:brightness(1.1)}
.upi-btn-secondary{background:#fff;border:2px solid #6366f1;color:#4f46e5;border-radius:12px;padding:10px 20px;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .15s}
.upi-btn-secondary:hover{background:#eef2ff}
.upi-btn-ghost{background:none;border:1.5px solid #e2e8f0;color:#64748b;border-radius:12px;padding:10px 20px;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .15s}
.upi-btn-ghost:hover{border-color:#94a3b8;color:#475569}
.upi-btn-danger{background:#fee2e2;border:1.5px solid #fca5a5;color:#991b1b;border-radius:12px;padding:10px 18px;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .15s}
.upi-btn-danger:hover{background:#fecaca}
.upi-zoom-modal{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out}
.upi-zoom-modal img{max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.upi-hidden{display:none!important}
@media print{body>*:not(#upi-receipt-print-area){display:none!important}#upi-receipt-print-area{display:block!important;padding:20px;font-family:system-ui}}
  `;
  document.head.appendChild(s);
}

// ============================================================
// HTML BUILDER
// ============================================================
function buildVerifierHTML() {
  return `
<div class="upi-verifier-root" id="upi-verifier-root">

  <!-- Step Indicator -->
  <div class="upi-steps" id="uv-steps">
    <div class="upi-step active" id="uv-step-1">
      <span>1</span><label>Pay & Upload</label>
    </div>
    <div class="upi-step-line"></div>
    <div class="upi-step" id="uv-step-2">
      <span>2</span><label>AI Verify</label>
    </div>
    <div class="upi-step-line"></div>
    <div class="upi-step" id="uv-step-3">
      <span>3</span><label>Unlocked</label>
    </div>
  </div>

  <!-- Panel 1: Pay & Upload -->
  <div id="uv-panel-1" class="upi-panel">
    <div class="upi-grid">

      <!-- Payment Card -->
      <div class="upi-card">
        <h3><i class="fa-solid fa-qrcode"></i> Pay via UPI</h3>
        <p class="upi-sub">Select amount, scan QR or copy UPI ID below</p>

        <!-- Amount Presets -->
        <div class="upi-amount-row" id="uv-presets"></div>
        <input type="number" id="uv-amount-input" class="upi-amount-input" placeholder="Custom amount (INR)" min="1" style="width:100%;margin-bottom:14px">

        <!-- QR Code -->
        <div class="upi-qr-box">
          <div class="upi-qr-container"><img id="uv-qr-img" src="" alt="UPI QR Code"></div>
          <div class="upi-qr-label">Scan with any UPI app</div>
        </div>

        <!-- UPI ID row -->
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:10px 0 8px">
          <span class="upi-id-text" id="uv-upi-display">9526569313@fam</span>
          <button class="upi-copy-btn" id="uv-copy-btn" title="Copy UPI ID">
            <i class="fa-regular fa-copy"></i>
          </button>
        </div>

        <!-- Deep link -->
        <a href="#" id="uv-deeplink" class="upi-deeplink-btn">
          <i class="fa-solid fa-mobile-screen-button"></i> Open in UPI App
        </a>
        <p class="upi-supported">Supported: FamPay · Google Pay · PhonePe · Paytm · BHIM · CRED · Amazon Pay</p>
      </div>

      <!-- Upload Card -->
      <div class="upi-card">
        <h3><i class="fa-solid fa-cloud-arrow-up"></i> Upload Payment Screenshot</h3>
        <p class="upi-sub">Drag & drop, click to browse, or press <kbd>Ctrl+V</kbd> to paste</p>

        <!-- Dropzone (shown when no image) -->
        <div id="uv-dropzone" class="upi-dropzone">
          <div>
            <div class="upi-drop-icon"><i class="fa-solid fa-image"></i></div>
            <div class="upi-drop-title">Drop screenshot here</div>
            <div class="upi-drop-hint">or <span class="upi-link">click to browse</span> &mdash; PNG, JPG, JPEG, WEBP</div>
          </div>
          <input type="file" id="uv-file-input" accept="image/png,image/jpeg,image/webp" style="display:none">
        </div>

        <!-- Image Preview (hidden until image selected) -->
        <div id="uv-preview-wrap" class="upi-hidden" style="text-align:center;margin-bottom:12px">
          <div class="upi-preview-wrap">
            <img id="uv-preview-img" class="upi-preview-img" alt="Payment Screenshot">
            <div class="upi-preview-overlay">
              <button onclick="UPIVerifier.zoomImage()" title="View full size"><i class="fa-solid fa-expand"></i></button>
            </div>
          </div>
          <button class="upi-change-btn" id="uv-change-btn"><i class="fa-solid fa-rotate"></i> Change Image</button>
        </div>

        <!-- Test Simulator -->
        <div class="upi-samples-box">
          <p class="upi-samples-label"><i class="fa-solid fa-flask"></i> Test Simulator — Click to test instantly</p>
          <div class="upi-samples-grid">
            <button class="upi-sample-btn upi-sample-ok" data-sid="fampay-valid"><i class="fa-solid fa-check-circle"></i>FamPay ₹199 ✓</button>
            <button class="upi-sample-btn upi-sample-ok" data-sid="phonepe-valid"><i class="fa-solid fa-check-circle"></i>PhonePe ₹499 ✓</button>
            <button class="upi-sample-btn upi-sample-bad" data-sid="gpay-wrong-upi"><i class="fa-solid fa-times-circle"></i>GPay Wrong UPI ✗</button>
            <button class="upi-sample-btn upi-sample-bad" data-sid="paytm-failed"><i class="fa-solid fa-times-circle"></i>Paytm Failed ✗</button>
          </div>
        </div>

        <!-- Verify Button -->
        <button id="uv-verify-btn" class="upi-verify-btn" disabled>
          <i class="fa-solid fa-shield-check"></i> Verify Payment Screenshot
        </button>
      </div>
    </div>

    <!-- Audit Log Toggle -->
    <div class="upi-audit-toggle" id="uv-audit-toggle">
      <i class="fa-solid fa-clock-rotate-left"></i>
      Verification History
      <span class="upi-audit-badge" id="uv-audit-count">0</span>
    </div>
    <div id="uv-audit-drawer" class="upi-audit-drawer upi-hidden"></div>
  </div>

  <!-- Panel 2: Verification -->
  <div id="uv-panel-2" class="upi-panel upi-hidden">
    <div class="upi-verify-layout">
      <!-- Scan Box -->
      <div class="upi-scan-box" id="uv-scan-box">
        <img id="uv-scan-img" class="upi-scan-img" alt="Scanning">
        <div class="upi-laser" id="uv-laser"></div>
        <div class="upi-scan-corner upi-tl"></div>
        <div class="upi-scan-corner upi-tr"></div>
        <div class="upi-scan-corner upi-bl"></div>
        <div class="upi-scan-corner upi-br"></div>
      </div>

      <!-- Stages + Results -->
      <div class="upi-stages-col">
        <h4 class="upi-stages-title"><i class="fa-solid fa-brain"></i> AI Verification</h4>

        <!-- Stage steps -->
        <div class="upi-stages-list" id="uv-stages-list">
          <div class="upi-stage" data-stage="0"><span class="upi-stage-icon"><i class="fa-solid fa-circle-notch fa-spin"></i></span>OCR text extraction & layout parsing</div>
          <div class="upi-stage" data-stage="1"><span class="upi-stage-icon"><i class="fa-solid fa-circle"></i></span>Matching UPI ID to 9526569313@fam</div>
          <div class="upi-stage" data-stage="2"><span class="upi-stage-icon"><i class="fa-solid fa-circle"></i></span>Validating 12-digit UTR reference</div>
          <div class="upi-stage" data-stage="3"><span class="upi-stage-icon"><i class="fa-solid fa-circle"></i></span>Checking bank execution status</div>
        </div>

        <!-- Result area (hidden until done) -->
        <div id="uv-result-area" class="upi-hidden">
          <div id="uv-result-banner" class="upi-result-banner"></div>
          <table class="upi-result-table" id="uv-result-table"></table>
          <div class="upi-result-actions" id="uv-result-actions"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Panel 3: Unlocked -->
  <div id="uv-panel-3" class="upi-panel upi-hidden">
    <div class="upi-unlocked-box">
      <div class="upi-confetti-area" id="uv-confetti"></div>
      <div class="upi-unlock-icon"><i class="fa-solid fa-lock-open"></i></div>
      <h3 class="upi-unlock-title">Payment Verified!</h3>
      <p class="upi-unlock-sub">Your payment has been confirmed. Welcome to StudioSuite PRO!</p>

      <!-- Token box -->
      <div class="upi-token-box">
        <p class="upi-token-label">Access License Token</p>
        <p class="upi-token-val" id="uv-token-display">—</p>
      </div>

      <!-- Actions -->
      <div class="upi-unlock-actions">
        <button class="upi-btn-primary" onclick="UPIVerifier.downloadReceipt()">
          <i class="fa-solid fa-download"></i> Download Receipt
        </button>
        <button class="upi-btn-secondary" onclick="window.print()">
          <i class="fa-solid fa-print"></i> Print
        </button>
        <button class="upi-btn-ghost" onclick="UPIVerifier.reset()">
          <i class="fa-solid fa-rotate-left"></i> Verify Another
        </button>
      </div>
    </div>
  </div>

  <!-- Hidden print area -->
  <div id="upi-receipt-print-area" style="display:none"></div>
</div>
`;
}

// ============================================================
// UPIVerifier CONTROLLER
// ============================================================
const UPIVerifier = (function() {
  let state = {
    step: 1,
    amount: PRESETS[0],
    imageDataUrl: null,
    sampleId: null,
    lastResult: null,
    countdownTimer: null,
    countdownPaused: false,
    countdownLeft: 3
  };

  // ---- Internal helpers ----
  function norm(s){ return (s||'').toLowerCase().replace(/\s+/g,'').replace(/[\u200B-\u200D\uFEFF]/g,''); }

  function updateQR() {
    const amt = state.amount || '';
    const uri = `upi://pay?pa=${TARGET_UPI}&pn=StudioSuitePRO&cu=INR${amt?'&am='+amt:''}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}&bgcolor=ffffff&color=4f46e5`;
    const img = document.getElementById('uv-qr-img');
    if (img) img.src = qrUrl;
    const dl = document.getElementById('uv-deeplink');
    if (dl) dl.href = uri;
  }

  function setStep(n) {
    state.step = n;
    [1,2,3].forEach(i => {
      const stepEl = document.getElementById('uv-step-'+i);
      const panelEl = document.getElementById('uv-panel-'+i);
      if (!stepEl || !panelEl) return;
      stepEl.classList.remove('active','done');
      panelEl.classList.add('upi-hidden');
      if (i < n) stepEl.classList.add('done');
      else if (i === n) stepEl.classList.add('active');
    });
    const panelEl = document.getElementById('uv-panel-'+n);
    if (panelEl) panelEl.classList.remove('upi-hidden');
  }

  function stageIcon(status) {
    if (status === 'active') return '<i class="fa-solid fa-circle-notch fa-spin" style="color:#6366f1"></i>';
    if (status === 'done')   return '<i class="fa-solid fa-circle-check" style="color:#22c55e"></i>';
    return '<i class="fa-solid fa-circle" style="color:#cbd5e1"></i>';
  }

  function animateStages(cb) {
    const items = document.querySelectorAll('#uv-stages-list .upi-stage');
    let idx = 0;
    items.forEach(el => {
      el.classList.remove('active','done');
      el.querySelector('.upi-stage-icon').innerHTML = stageIcon('pending');
    });
    function next() {
      if (idx >= items.length) { if (cb) cb(); return; }
      items[idx].classList.add('active');
      items[idx].querySelector('.upi-stage-icon').innerHTML = stageIcon('active');
      if (idx > 0) {
        items[idx-1].classList.remove('active'); items[idx-1].classList.add('done');
        items[idx-1].querySelector('.upi-stage-icon').innerHTML = stageIcon('done');
      }
      idx++;
      setTimeout(next, 700 + Math.random()*400);
    }
    next();
  }

  function showResult(result) {
    // Mark all stages done
    document.querySelectorAll('#uv-stages-list .upi-stage').forEach(el => {
      el.classList.remove('active'); el.classList.add('done');
      el.querySelector('.upi-stage-icon').innerHTML = stageIcon('done');
    });
    // Stop laser
    const laser = document.getElementById('uv-laser');
    if (laser) laser.style.display = 'none';

    const area = document.getElementById('uv-result-area');
    const banner = document.getElementById('uv-result-banner');
    const table = document.getElementById('uv-result-table');
    const actions = document.getElementById('uv-result-actions');
    if (!area) return;
    area.classList.remove('upi-hidden');

    const ex = result.extraction || {};
    const isVerified = result.status === 'VERIFIED';

    banner.className = 'upi-result-banner ' + (isVerified ? 'verified' : 'rejected');
    banner.innerHTML = isVerified
      ? `<i class="fa-solid fa-circle-check" style="font-size:1.2rem"></i><div><strong>Payment Verified!</strong><br><span style="font-weight:400">Your payment has been confirmed successfully.</span></div>`
      : `<i class="fa-solid fa-circle-xmark" style="font-size:1.2rem"></i><div><strong>Verification Failed</strong><br><span style="font-weight:400">${result.rejectionReason||'Payment could not be verified.'}</span></div>`;

    const rows = [
      ['Detected UPI', ex.recipientUpiId||'—'],
      ['Expected UPI', TARGET_UPI],
      ['UPI Match', ex.upiMatch ? '✅ Match' : '❌ Mismatch'],
      ['UTR / Ref No.', ex.transactionId||'—'],
      ['Amount', ex.amount ? '₹'+ex.amount : '—'],
      ['Payment App', ex.paymentApp||'—'],
      ['Status', ex.paymentStatus||'—'],
      ['AI Confidence', (ex.confidenceScore||0)+'%'],
    ];
    table.innerHTML = rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');

    actions.innerHTML = '';
    if (isVerified) {
      state.countdownLeft = 3;
      const countdownDiv = document.createElement('div');
      countdownDiv.innerHTML = `
        <div style="font-size:12px;color:#15803d;font-weight:600;margin-bottom:4px">Auto-proceeding in <span id="uv-cdnum">3</span>s (hover to pause)</div>
        <div class="upi-countdown-bar"><div class="upi-countdown-fill" id="uv-cd-fill" style="width:100%"></div></div>`;
      actions.appendChild(countdownDiv);

      const btn = document.createElement('button');
      btn.className = 'upi-btn-primary';
      btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Continue to Next Step';
      btn.onclick = () => { clearInterval(state.countdownTimer); goToStep3(result); };
      actions.appendChild(btn);

      const cdArea = countdownDiv.querySelector('.upi-countdown-bar');
      cdArea.addEventListener('mouseenter', () => { state.countdownPaused = true; });
      cdArea.addEventListener('mouseleave', () => { state.countdownPaused = false; });

      const total = 3000;
      const tick = 100;
      let elapsed = 0;
      state.countdownTimer = setInterval(() => {
        if (state.countdownPaused) return;
        elapsed += tick;
        const pct = Math.max(0, 100 - (elapsed/total)*100);
        const fill = document.getElementById('uv-cd-fill');
        const num  = document.getElementById('uv-cdnum');
        if (fill) fill.style.width = pct + '%';
        if (num)  num.textContent = Math.ceil((total-elapsed)/1000);
        if (elapsed >= total) { clearInterval(state.countdownTimer); goToStep3(result); }
      }, tick);

    } else {
      const retryBtn = document.createElement('button');
      retryBtn.className = 'upi-btn-danger';
      retryBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Upload Different Screenshot';
      retryBtn.onclick = () => reset();
      actions.appendChild(retryBtn);
    }
  }

  function goToStep3(result) {
    state.lastResult = result;
    const ex = result.extraction || {};
    // Display token
    const tokenEl = document.getElementById('uv-token-display');
    if (tokenEl) tokenEl.textContent = result.token || generateLocalToken(ex.transactionId);
    // Confetti
    spawnConfetti();
    // Build print area
    buildPrintArea(result);
    setStep(3);
    // Store to audit
    appendAudit({
      status: result.status,
      utr: ex.transactionId||'—',
      amount: ex.amount||null,
      app: ex.paymentApp||'—',
      upiId: ex.recipientUpiId||'—',
      token: result.token||null
    });
    refreshAuditDrawer();
  }

  function generateLocalToken(utr) {
    const ts = Date.now().toString(36).toUpperCase();
    const utrPart = (utr||'000000000000').slice(-6);
    return `SS-${utrPart}-${ts}`;
  }

  function spawnConfetti() {
    const area = document.getElementById('uv-confetti');
    if (!area) return;
    area.innerHTML = '';
    const colors = ['#6366f1','#22c55e','#f59e0b','#ec4899','#06b6d4'];
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('div');
      p.className = 'upi-confetti-piece';
      p.style.cssText = `left:${Math.random()*100}%;background:${colors[i%colors.length]};animation-delay:${Math.random()*1.5}s;animation-duration:${1.5+Math.random()}s;width:${5+Math.random()*8}px;height:${5+Math.random()*8}px;border-radius:${Math.random()>0.5?'50%':'3px'}`;
      area.appendChild(p);
    }
  }

  function buildPrintArea(result) {
    const ex = result.extraction || {};
    const area = document.getElementById('upi-receipt-print-area');
    if (!area) return;
    area.innerHTML = `
      <div style="max-width:480px;margin:40px auto;font-family:system-ui,sans-serif;padding:30px;border:2px solid #e2e8f0;border-radius:16px">
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:2rem;color:#22c55e">✅</div>
          <h2 style="margin:8px 0 4px;font-size:20px;font-weight:900">Official Payment Verification Receipt</h2>
          <p style="color:#64748b;font-size:12px;margin:0">StudioSuite PRO &mdash; ${new Date().toLocaleString('en-IN')}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          ${[
            ['Status', result.status === 'VERIFIED' ? '✅ VERIFIED' : '❌ REJECTED'],
            ['Recipient UPI', ex.recipientUpiId||'—'],
            ['Recipient Name', ex.recipientName||'—'],
            ['UTR / Ref No.', ex.transactionId||'—'],
            ['Amount', ex.amount ? '₹'+ex.amount : '—'],
            ['Payment App', ex.paymentApp||'—'],
            ['Payment Status', ex.paymentStatus||'—'],
            ['AI Confidence', (ex.confidenceScore||0)+'%'],
            ['Access Token', result.token||generateLocalToken(ex.transactionId)],
            ['Verified At', new Date().toLocaleString('en-IN')],
          ].map(([k,v])=>`<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:7px 4px;color:#94a3b8;font-weight:600;width:42%">${k}</td><td style="padding:7px 4px;font-weight:700">${v}</td></tr>`).join('')}
        </table>
      </div>`;
  }

  function reset() {
    if (state.countdownTimer) clearInterval(state.countdownTimer);
    state = { step:1, amount:state.amount, imageDataUrl:null, sampleId:null, lastResult:null, countdownTimer:null, countdownPaused:false, countdownLeft:3 };
    // Reset UI
    const dz = document.getElementById('uv-dropzone');
    const pw = document.getElementById('uv-preview-wrap');
    const vb = document.getElementById('uv-verify-btn');
    if (dz) dz.classList.remove('upi-hidden');
    if (pw) pw.classList.add('upi-hidden');
    if (vb) vb.disabled = true;
    const fi = document.getElementById('uv-file-input');
    if (fi) fi.value = '';
    // Reset result area
    const ra = document.getElementById('uv-result-area');
    if (ra) ra.classList.add('upi-hidden');
    const laser = document.getElementById('uv-laser');
    if (laser) laser.style.display = '';
    setStep(1);
  }

  function refreshAuditDrawer() {
    const log = getAuditLog();
    const badge = document.getElementById('uv-audit-count');
    if (badge) badge.textContent = log.length;
    const drawer = document.getElementById('uv-audit-drawer');
    if (!drawer || drawer.classList.contains('upi-hidden')) return;
    drawer.innerHTML = log.length === 0
      ? '<p style="text-align:center;color:#94a3b8;font-size:12px;padding:16px 0">No verification history yet.</p>'
      : log.map(e => `
        <div class="upi-audit-row">
          <span class="${e.status==='VERIFIED'?'upi-audit-badge-v':'upi-audit-badge-r'}">${e.status}</span>
          <span style="flex:1;overflow:hidden">
            <span style="font-weight:700;color:#1e293b">${e.utr}</span>
            <span style="color:#94a3b8;margin-left:6px">${e.app}</span>
            ${e.amount?`<span style="color:#6366f1;font-weight:700;margin-left:6px">₹${e.amount}</span>`:''}
          </span>
          <span style="color:#cbd5e1;font-size:10px;white-space:nowrap">${new Date(e.ts).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>
        </div>`).join('');
  }

  // ---- Public API ----
  return {

    init() {
      injectStyles();
      const mount = document.getElementById('upi-verifier-mount');
      if (!mount) return;
      mount.innerHTML = buildVerifierHTML();
      setStep(1);

      // Presets
      const presetsRow = document.getElementById('uv-presets');
      if (presetsRow) {
        PRESETS.forEach(p => {
          const btn = document.createElement('button');
          btn.className = 'upi-preset-btn' + (p === state.amount ? ' active' : '');
          btn.textContent = '₹'+p;
          btn.onclick = () => {
            state.amount = p;
            document.querySelectorAll('.upi-preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('uv-amount-input').value = '';
            updateQR();
          };
          presetsRow.appendChild(btn);
        });
      }

      // Custom amount input
      const amtInput = document.getElementById('uv-amount-input');
      if (amtInput) {
        amtInput.addEventListener('input', () => {
          const v = parseFloat(amtInput.value);
          if (!isNaN(v) && v > 0) {
            state.amount = v;
            document.querySelectorAll('.upi-preset-btn').forEach(b => b.classList.remove('active'));
            updateQR();
          }
        });
      }

      updateQR();

      // Copy UPI ID
      const copyBtn = document.getElementById('uv-copy-btn');
      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(TARGET_UPI).then(() => {
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
            }, 2000);
          }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = TARGET_UPI; ta.style.position='fixed'; ta.style.opacity='0';
            document.body.appendChild(ta); ta.select(); document.execCommand('copy');
            document.body.removeChild(ta);
          });
        };
      }

      // Dropzone click
      const dz = document.getElementById('uv-dropzone');
      const fi = document.getElementById('uv-file-input');
      if (dz && fi) {
        dz.addEventListener('click', () => fi.click());
        dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
        dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
        dz.addEventListener('drop', e => {
          e.preventDefault(); dz.classList.remove('drag-over');
          const f = e.dataTransfer.files[0];
          if (f) loadFile(f);
        });
        fi.addEventListener('change', () => { if (fi.files[0]) loadFile(fi.files[0]); });
      }

      // Change button
      const changBtn = document.getElementById('uv-change-btn');
      if (changBtn) {
        changBtn.onclick = () => {
          state.imageDataUrl = null; state.sampleId = null;
          const pw = document.getElementById('uv-preview-wrap');
          if (pw) pw.classList.add('upi-hidden');
          if (dz) dz.classList.remove('upi-hidden');
          if (fi) fi.value = '';
          const vb = document.getElementById('uv-verify-btn');
          if (vb) vb.disabled = true;
        };
      }

      // Global paste listener
      document.addEventListener('paste', e => {
        if (state.step !== 1) return;
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            loadFile(item.getAsFile());
            break;
          }
        }
      });

      // Sample buttons
      document.querySelectorAll('.upi-sample-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const sid = btn.dataset.sid;
          const dataUrl = generateSampleReceipt(sid);
          state.imageDataUrl = dataUrl; state.sampleId = sid;
          showPreview(dataUrl);
          const vb = document.getElementById('uv-verify-btn');
          if (vb) vb.disabled = false;
        });
      });

      // Verify button
      const verifyBtn = document.getElementById('uv-verify-btn');
      if (verifyBtn) {
        verifyBtn.onclick = () => startVerification();
      }

      // Audit toggle
      const auditToggle = document.getElementById('uv-audit-toggle');
      if (auditToggle) {
        auditToggle.addEventListener('click', () => {
          const drawer = document.getElementById('uv-audit-drawer');
          if (!drawer) return;
          drawer.classList.toggle('upi-hidden');
          refreshAuditDrawer();
        });
      }
      refreshAuditDrawer();
    },

    reset,
    zoomImage() {
      if (!state.imageDataUrl) return;
      const modal = document.createElement('div');
      modal.className = 'upi-zoom-modal';
      const img = document.createElement('img');
      img.src = state.imageDataUrl;
      modal.appendChild(img);
      modal.onclick = () => modal.remove();
      document.body.appendChild(modal);
    },

    downloadReceipt() {
      const area = document.getElementById('upi-receipt-print-area');
      if (!area) return;
      const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payment Receipt</title></head><body>${area.innerHTML}</body></html>`], {type:'text/html'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `StudioSuite-Payment-Receipt-${Date.now()}.html`;
      a.click();
    }
  };

  // ---- File loader ----
  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      state.imageDataUrl = e.target.result;
      state.sampleId = null;
      showPreview(e.target.result);
      const vb = document.getElementById('uv-verify-btn');
      if (vb) vb.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  function showPreview(dataUrl) {
    const img = document.getElementById('uv-preview-img');
    if (img) img.src = dataUrl;
    const pw = document.getElementById('uv-preview-wrap');
    const dz = document.getElementById('uv-dropzone');
    if (pw) pw.classList.remove('upi-hidden');
    if (dz) dz.classList.add('upi-hidden');
  }

  async function startVerification() {
    if (!state.imageDataUrl && !state.sampleId) return;
    setStep(2);
    const scanImg = document.getElementById('uv-scan-img');
    if (scanImg && state.imageDataUrl) scanImg.src = state.imageDataUrl;
    const ra = document.getElementById('uv-result-area');
    if (ra) ra.classList.add('upi-hidden');
    const laser = document.getElementById('uv-laser');
    if (laser) laser.style.display = '';

    animateStages(async () => {
      try {
        const payload = { expectedUpiId: TARGET_UPI };
        if (state.sampleId) {
          payload.sampleId = state.sampleId;
        } else {
          payload.imageBase64 = state.imageDataUrl;
          if (state.amount) payload.expectedAmount = state.amount;
        }

        const resp = await fetch(VERIFY_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await resp.json();
        if (!result.ok) throw new Error(result.error || 'Verification failed');
        showResult(result);
      } catch(err) {
        showResult({
          status: 'REJECTED',
          rejectionReason: 'Network error or server unavailable: ' + err.message,
          extraction: {},
          token: null
        });
      }
    });
  }
})();

// ============================================================
// AUTO-INIT
// ============================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => UPIVerifier.init());
} else {
  UPIVerifier.init();
}

})(); // end IIFE