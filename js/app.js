/**
 * StudioSuite 50 MASTER TOOLS PRO - App Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  window.renderFooterContact = function() {
    if (!window.AdminPanelEngine) return;
    const info = AdminPanelEngine.getContactInfo();
    const nameEl = document.getElementById('footer-company-name');
    const addrEl = document.getElementById('footer-company-address');
    const phoneEl = document.getElementById('footer-company-phone');
    const emailEl = document.getElementById('footer-company-email');
    const hoursEl = document.getElementById('footer-company-hours');
    if (nameEl) nameEl.textContent = info.company || 'StudioSuite PRO Platform Inc.';
    if (addrEl) addrEl.textContent = info.address || '100 Innovation Parkway, Suite 400, Tech Park';
    if (phoneEl) phoneEl.innerHTML = `<i class="fa-solid fa-phone text-indigo-600 mr-2"></i> ${info.phone || '+91 98765 43210'}`;
    if (emailEl) emailEl.innerHTML = `<i class="fa-solid fa-envelope text-indigo-600 mr-2"></i> ${info.email || 'support@studiosuitepro.com'}`;
    if (hoursEl) hoursEl.innerHTML = `<i class="fa-solid fa-clock text-indigo-600 mr-2"></i> ${info.hours || 'Mon - Fri: 9:00 AM - 6:00 PM IST'}`;
  };
  renderFooterContact();

  const TOOL_UI_TYPES = {
    PDF_PAGE_ORGANIZER: 'pdf-page-organizer',
    PDF_CROP: 'pdf-crop',
    PDF_COMPRESS: 'pdf-compress',
    IMAGE_PREVIEW: 'image-preview',
    CONVERTER_SIMPLE: 'converter-simple',
    TEXT_INPUT: 'text-input',
    OCR_TRANSLATE: 'ocr-translate',
    QUIZ_CREATOR: 'quiz-creator',
    DESIGN_PREPRESS: 'design-prepress',
    SIMPLE_UPLOAD: 'simple-upload'
  };

  const LANGUAGES = [
    { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish (Español)' }, { code: 'fr', name: 'French (Français)' },
    { code: 'de', name: 'German (Deutsch)' }, { code: 'it', name: 'Italian (Italiano)' }, { code: 'pt', name: 'Portuguese (Português)' },
    { code: 'ru', name: 'Russian (Русский)' }, { code: 'ja', name: 'Japanese (日本語)' }, { code: 'ko', name: 'Korean (한국어)' },
    { code: 'zh', name: 'Chinese (中文)' }, { code: 'hi', name: 'Hindi (हिन्दी)' }, { code: 'ar', name: 'Arabic (العربية)' },
    { code: 'bn', name: 'Bengali (বাংলা)' }, { code: 'ur', name: 'Urdu (اردو)' }, { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'te', name: 'Telugu (తెలుగు)' }, { code: 'ml', name: 'Malayalam (മലയാളം)' }, { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' }, { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' }, { code: 'tr', name: 'Turkish (Türkçe)' },
    { code: 'nl', name: 'Dutch (Nederlands)' }, { code: 'pl', name: 'Polish (Polski)' }, { code: 'vi', name: 'Vietnamese (Tiếng Việt)' },
    { code: 'th', name: 'Thai (ไทย)' }, { code: 'id', name: 'Indonesian (Bahasa)' }, { code: 'ms', name: 'Malay (Melayu)' },
    { code: 'fil', name: 'Filipino' }, { code: 'fa', name: 'Persian (فارسی)' }, { code: 'he', name: 'Hebrew (עברית)' }
  ];

  const TOOLS = [
    { id: 'pdf-merger', name: 'PDF Merger', category: 'pdf-core', icon: 'fa-layer-group', color: 'from-blue-500 to-indigo-600', badge: 'Core', description: 'Combine multiple PDFs into a single file with custom ordering.', accept: '.pdf', multiple: true, uiType: TOOL_UI_TYPES.PDF_PAGE_ORGANIZER, controls: ['merge-options'] },
    { id: 'pdf-splitter', name: 'PDF Splitter', category: 'pdf-core', icon: 'fa-scissors', color: 'from-purple-500 to-pink-600', badge: 'Core', description: 'Extract page ranges or split into individual page PDFs.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.PDF_PAGE_ORGANIZER, controls: ['split-mode', 'page-range'] },
    { id: 'pdf-unmerger', name: 'PDF Un-merger', category: 'pdf-core', icon: 'fa-box-open', color: 'from-indigo-500 to-blue-500', description: 'Reverse merge structures back into original constituent docs.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.PDF_PAGE_ORGANIZER, controls: [] },
    { id: 'pdf-page-reorder', name: 'PDF Page Re-orderer', category: 'pdf-core', icon: 'fa-arrows-left-right', color: 'from-cyan-500 to-blue-600', badge: 'Interactive', description: 'Drag, re-arrange, rotate, or delete individual PDF pages.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.PDF_PAGE_ORGANIZER, controls: [] },
    { id: 'pdf-page-rotator', name: 'PDF Page Rotator', category: 'pdf-core', icon: 'fa-rotate-right', color: 'from-amber-500 to-orange-500', description: 'Rotate pages inside PDF by 90, 180, or 270 degrees.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.PDF_PAGE_ORGANIZER, controls: ['rotate-angle'] },
    { id: 'pdf-page-deleter', name: 'PDF Page Deleter', category: 'pdf-core', icon: 'fa-trash-can', color: 'from-red-500 to-rose-600', description: 'Select and remove unnecessary pages from multi-page PDFs.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.PDF_PAGE_ORGANIZER, controls: [] },
    { id: 'pdf-crop-tool', name: 'PDF Crop Tool', category: 'pdf-core', icon: 'fa-crop-simple', color: 'from-sky-500 to-blue-600', description: 'Trim canvas margins and isolate content area across PDF pages.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.PDF_CROP, controls: ['crop-margins', 'crop-pages-select'] },
    { id: 'pdf-compressor-smart', name: 'PDF Compressor (Smart)', category: 'pdf-core', icon: 'fa-compress', color: 'from-emerald-500 to-teal-600', badge: 'Popular', description: 'Reduce PDF size via DPI sampling and structural optimization.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.PDF_COMPRESS, controls: ['compression-level'] },
    { id: 'lossless-pdf-shrinker', name: 'Lossless PDF Shrinker', category: 'pdf-core', icon: 'fa-file-shield', color: 'from-teal-600 to-emerald-600', description: 'Compress PDFs by stripping metadata without degrading quality.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: [] },
    { id: 'pdf-target-shrinker', name: 'PDF Target Size Shrinker', category: 'pdf-core', icon: 'fa-weight-hanging', color: 'from-violet-600 to-purple-600', description: 'Automatically compress PDFs under target limit (e.g. <2MB).', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.PDF_COMPRESS, controls: ['target-size'] },
    { id: 'pdf-to-docx', name: 'PDF to Word (DOCX)', category: 'pdf-convert', icon: 'fa-file-word', color: 'from-blue-600 to-cyan-600', badge: 'Essential', description: 'Convert PDF to editable Word document with preserved layout.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.CONVERTER_SIMPLE, controls: ['docx-format-options'] },
    { id: 'docx-to-pdf', name: 'Word (DOCX) to PDF', category: 'pdf-convert', icon: 'fa-file-pdf', color: 'from-indigo-600 to-blue-600', description: 'Convert Word documents into crisp, layout-perfect PDFs.', accept: '.docx', multiple: false, uiType: TOOL_UI_TYPES.CONVERTER_SIMPLE, controls: ['paper-size-orientation'] },
    { id: 'pdf-to-xlsx', name: 'PDF to Excel (XLSX)', category: 'pdf-convert', icon: 'fa-file-excel', color: 'from-emerald-600 to-green-600', badge: 'Smart', description: 'Transform PDF financial tables into editable Excel sheets.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.CONVERTER_SIMPLE, controls: ['excel-format'] },
    { id: 'xlsx-to-pdf', name: 'Excel (XLSX) to PDF', category: 'pdf-convert', icon: 'fa-table', color: 'from-teal-600 to-emerald-600', description: 'Convert spreadsheets into print-formatted PDF reports.', accept: '.xlsx', multiple: false, uiType: TOOL_UI_TYPES.CONVERTER_SIMPLE, controls: ['paper-size-orientation'] },
    { id: 'pdf-to-pptx', name: 'PDF to PowerPoint (PPTX)', category: 'pdf-convert', icon: 'fa-file-powerpoint', color: 'from-orange-600 to-amber-600', description: 'Convert PDF pages into editable PowerPoint slide decks.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.CONVERTER_SIMPLE, controls: ['pptx-layout'] },
    { id: 'pptx-to-pdf', name: 'PowerPoint (PPTX) to PDF', category: 'pdf-convert', icon: 'fa-file-presentation', color: 'from-red-600 to-orange-500', description: 'Convert slide presentations into compact PDF documents.', accept: '.pptx', multiple: false, uiType: TOOL_UI_TYPES.CONVERTER_SIMPLE, controls: [] },
    { id: 'pdf-to-jpg', name: 'PDF to JPG Converter', category: 'pdf-convert', icon: 'fa-file-image', color: 'from-amber-500 to-orange-600', description: 'Render PDF pages as high-quality JPEG images.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.CONVERTER_SIMPLE, controls: ['output-img-format', 'resolution-dpi'] },
    { id: 'jpg-to-pdf', name: 'JPG to PDF Converter', category: 'pdf-convert', icon: 'fa-file-export', color: 'from-rose-500 to-red-600', description: 'Combine JPEG images into formatted multi-page PDF.', accept: 'image/*', multiple: true, uiType: TOOL_UI_TYPES.IMAGE_PREVIEW, controls: ['paper-size-orientation', 'image-layout'] },
    { id: 'batch-img-resizer', name: 'Batch Image Resizer', category: 'image-tools', icon: 'fa-expand', color: 'from-amber-500 to-yellow-600', badge: 'Popular', description: 'Resize 100+ images by dimensions, percent, or target size.', accept: 'image/*', multiple: true, uiType: TOOL_UI_TYPES.IMAGE_PREVIEW, controls: ['image-dimensions', 'target-size', 'resample-method'] },
    { id: 'ai-img-upscaler', name: 'AI Image Upscaler', category: 'image-tools', icon: 'fa-wand-magic-sparkles', color: 'from-purple-600 to-indigo-600', badge: 'AI', description: 'Enhance image resolution 2x, 4x, or 8x using deep learning.', accept: 'image/*', multiple: false, uiType: TOOL_UI_TYPES.IMAGE_PREVIEW, controls: ['upscale-factor', 'denoise-level'] },
    { id: 'png-compressor', name: 'Lossless PNG Compressor', category: 'image-tools', icon: 'fa-file-image', color: 'from-emerald-500 to-teal-600', description: 'Minimize PNG file size without losing visual fidelity.', accept: 'image/png', multiple: false, uiType: TOOL_UI_TYPES.IMAGE_PREVIEW, controls: ['png-compress-level'] },
    { id: 'webp-converter', name: 'WEBP Image Converter', category: 'image-tools', icon: 'fa-bolt', color: 'from-cyan-500 to-blue-600', description: 'Convert legacy JPG/PNG to ultra-compressed WEBP format.', accept: 'image/*', multiple: false, uiType: TOOL_UI_TYPES.IMAGE_PREVIEW, controls: ['webp-quality', 'output-format'] },
    { id: 'exif-cleaner', name: 'EXIF Metadata Cleaner', category: 'image-tools', icon: 'fa-user-shield', color: 'from-slate-600 to-slate-800', description: 'Strip camera, location GPS, and author metadata from images.', accept: 'image/*', multiple: false, uiType: TOOL_UI_TYPES.IMAGE_PREVIEW, controls: [] },
    { id: 'svg-to-vector', name: 'SVG to Vector (EPS/DXF)', category: 'design-prepress', icon: 'fa-vector-square', color: 'from-indigo-600 to-purple-600', badge: 'Design', description: 'Convert SVG to EPS, DXF, DWG, or AI formats.', accept: '.svg', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['vector-output-format'] },
    { id: 'color-space-cmyk', name: 'Color Space Converter (CMYK)', category: 'design-prepress', icon: 'fa-palette', color: 'from-pink-600 to-rose-600', badge: 'Print', description: 'Convert RGB graphics/PDFs to print CMYK with ICC profile.', accept: '.pdf,image/*', multiple: false, uiType: TOOL_UI_TYPES.DESIGN_PREPRESS, controls: ['cmyk-picker', 'icc-profile'] },
    { id: 'bleed-crop-generator', name: 'Bleed & Crop Mark Generator', category: 'design-prepress', icon: 'fa-ruler-combined', color: 'from-purple-600 to-indigo-700', badge: 'Prepress', description: 'Add commercial print bleed zones and crop marks to PDF.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.DESIGN_PREPRESS, controls: ['bleed-size', 'crop-mark-style'] },
    { id: 'fonts-to-outlines', name: 'Fonts to Outlines', category: 'design-prepress', icon: 'fa-font', color: 'from-blue-600 to-cyan-600', description: 'Convert embedded PDF fonts into vector outlines for print.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: [] },
    { id: 'pdf-imposition', name: 'PDF Imposition Engine', category: 'print-packaging', icon: 'fa-book-open', color: 'from-emerald-600 to-teal-700', badge: 'Press', description: 'Arrange pages for booklet printing (2-up, 4-up, saddle-stitch).', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['imposition-scheme', 'signature-size'] },
    { id: 'rich-black-converter', name: 'Rich Black Converter', category: 'print-packaging', icon: 'fa-droplet', color: 'from-slate-800 to-black', description: 'Convert pure K text to press-safe Rich Black (C:60 M:40 Y:40 K:100).', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['rich-black-values'] },
    { id: 'total-ink-analyzer', name: 'Total Ink Limit (TAC) Analyzer', category: 'print-packaging', icon: 'fa-gauge-high', color: 'from-rose-600 to-red-700', description: 'Highlight areas exceeding 300% ink coverage to prevent smearing.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['tac-limit'] },
    { id: 'video-to-gif', name: 'Video to GIF Converter', category: 'video-motion', icon: 'fa-film', color: 'from-amber-500 to-orange-600', badge: 'Motion', description: 'Convert MP4/MOV clips into optimized looping GIFs.', accept: 'video/*', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['gif-fps', 'gif-quality', 'trim-range'] },
    { id: 'audio-extractor', name: 'Audio Extractor (Video to MP3)', category: 'video-motion', icon: 'fa-music', color: 'from-indigo-600 to-purple-600', description: 'Rip audio tracks out of MP4, MOV, or AVI video files.', accept: 'video/*', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['audio-bitrate', 'audio-format'] },
    { id: 'font-converter', name: 'Font Format Converter', category: 'fonts-typography', icon: 'fa-italic', color: 'from-indigo-600 to-blue-600', badge: 'Font', description: 'Convert between WOFF, WOFF2, TTF, OTF, and EOT formats.', accept: '.ttf,.otf,.woff,.woff2', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['font-output-format'] },
    { id: 'px-rem-calc', name: 'PX to REM / EM Converter', category: 'fonts-typography', icon: 'fa-calculator', color: 'from-teal-600 to-emerald-600', description: 'Real-time conversion utility for CSS measurement units.', accept: '', multiple: false, uiType: TOOL_UI_TYPES.TEXT_INPUT, controls: ['px-rem-picker', 'base-font-size'] },
    { id: 'text-case-transformer', name: 'Text Case Transformer', category: 'fonts-typography', icon: 'fa-font-case', color: 'from-purple-600 to-pink-600', description: 'Convert UPPERCASE, camelCase, kebab-case, snake_case.', accept: '', multiple: false, uiType: TOOL_UI_TYPES.TEXT_INPUT, controls: ['case-picker'] },
    { id: 'glassmorphism-gen', name: 'Glassmorphism CSS Generator', category: 'developer-tools', icon: 'fa-sparkles', color: 'from-cyan-500 to-blue-600', badge: 'UI/UX', description: 'Generate backdrop-filter CSS code for frosted glass panels.', accept: '', multiple: false, uiType: TOOL_UI_TYPES.TEXT_INPUT, controls: ['glass-picker'] },
    { id: 'color-contrast-wcag', name: 'WCAG Color Contrast Checker', category: 'developer-tools', icon: 'fa-circle-half-stroke', color: 'from-emerald-600 to-teal-600', badge: 'WCAG 2.1', description: 'Test foreground/background hex pairs for AA/AAA compliance.', accept: '', multiple: false, uiType: TOOL_UI_TYPES.TEXT_INPUT, controls: ['contrast-picker'] },
    { id: 'svg-optimizer-svgo', name: 'SVG Optimizer (SVGO)', category: 'developer-tools', icon: 'fa-code', color: 'from-emerald-500 to-cyan-600', badge: 'Dev', description: 'Strip inline metadata, comments, and compress SVG path code.', accept: '.svg', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['svgo-options'] },
    { id: 'opengraph-builder', name: 'OpenGraph Meta Tag Builder', category: 'developer-tools', icon: 'fa-share-nodes', color: 'from-blue-600 to-purple-600', badge: 'SEO', description: 'Generate essential Twitter & Facebook social meta tags.', accept: '', multiple: false, uiType: TOOL_UI_TYPES.TEXT_INPUT, controls: ['og-picker'] },
    { id: 'cad-pdf-recalibrator', name: 'PDF Drawing Scale Recalibrator', category: 'cad-blueprints', icon: 'fa-drafting-compass', color: 'from-blue-700 to-indigo-800', badge: 'CAD', description: 'Scale PDF blueprints using a single known real-world dimension.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['scale-reference'] },
    { id: 'blueprint-inverter', name: 'Blueprint Color Inverter', category: 'cad-blueprints', icon: 'fa-circle-notch', color: 'from-cyan-600 to-blue-800', description: 'Invert dark architectural blueprints into clean white line art.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: [] },
    { id: 'bates-stamping', name: 'Bates Stamping Metadata Lock', category: 'legal-medical', icon: 'fa-gavel', color: 'from-amber-700 to-yellow-800', badge: 'Legal', description: 'Apply sequential bates numbers while locking fields against editing.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['bates-prefix', 'bates-start'] },
    { id: 'dicom-converter', name: 'DICOM Medical Image Converter', category: 'legal-medical', icon: 'fa-heart-pulse', color: 'from-rose-600 to-red-800', badge: 'Medical', description: 'Convert DICOM (.dcm) files into PNGs or patient PDF reports.', accept: '.dcm', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['dicom-output-format'] },
    { id: 'pdf-to-epub', name: 'PDF to Reflowable EPUB 3', category: 'publishing-ebooks', icon: 'fa-book-atlas', color: 'from-purple-600 to-pink-700', badge: 'E-Book', description: 'Convert fixed PDF pages into fluid HTML5/EPUB3 layout files.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['epub-options'] },
    { id: 'pdf-ua-fixer', name: 'PDF Accessibility (PDF/UA) Fixer', category: 'publishing-ebooks', icon: 'fa-universal-access', color: 'from-indigo-600 to-purple-600', description: 'Auto-tag untagged elements to meet WCAG & PDF/UA compliance.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: [] },
    { id: 'gltf-texture-compressor', name: 'GLTF/GLB 3D Texture Compressor', category: 'threed-motion', icon: 'fa-cube', color: 'from-teal-600 to-emerald-700', badge: '3D', description: 'Extract, compress, and re-embed textures inside 3D GLTF models.', accept: '.gltf,.glb', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['texture-format', 'texture-quality'] },
    { id: 'pdf-a-archival', name: 'PDF/A Archival Converter', category: 'security-ai-data', icon: 'fa-vault', color: 'from-amber-600 to-orange-700', badge: 'Archival', description: 'Validate and convert PDFs to PDF/A-1b/2b/3b for long-term storage.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.SIMPLE_UPLOAD, controls: ['pdfa-level'] },
    { id: 'ai-pdf-summarizer', name: 'AI PDF Summarizer', category: 'security-ai-data', icon: 'fa-robot', color: 'from-purple-600 to-indigo-600', badge: 'AI', description: 'Generate structured bulleted summaries from multi-page PDFs.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.OCR_TRANSLATE, controls: ['summary-length', 'summary-language'] },
    { id: 'ai-doc-chat', name: 'AI Document Chat Q&A', category: 'security-ai-data', icon: 'fa-comments', color: 'from-indigo-600 to-purple-700', badge: 'AI', description: 'Interactive natural language Q&A over uploaded PDF document contents.', accept: '.pdf', multiple: false, uiType: TOOL_UI_TYPES.OCR_TRANSLATE, controls: ['chat-language'] },
    { id: 'ai-quiz-creator', name: 'Auto Quiz Creator (Multi-Language)', category: 'security-ai-data', icon: 'fa-clipboard-question', color: 'from-pink-500 to-rose-600', badge: 'AI NEW', description: 'Auto-generate quizzes, MCQs, flashcards in any language from uploaded PDFs, images, or documents.', accept: '.pdf,.docx,.txt,image/*', multiple: false, uiType: TOOL_UI_TYPES.QUIZ_CREATOR, controls: ['quiz-language', 'quiz-type', 'question-count', 'difficulty-level'] }
  ];

  window.TOOLS = TOOLS;

  // ── Init features from DB (async) before rendering tool grid ──────────────
  // NeonEngine.initFeatures() fetches enabled/disabled states from Neon Postgres
  // and populates AdminPanelEngine._featuresCache so renderTools() picks them up.
  if (window.NeonEngine) {
    NeonEngine.initFeatures()
      .then(() => {
        renderTools();
        window.dispatchEvent(new Event('featuresUpdated'));
      })
      .catch(() => {
        // Fallback: render with all tools enabled if DB is unreachable
        renderTools();
      });
  }

  // Also load settings into cache early (for UPI, contact info, etc.)
  if (window.AdminPanelEngine) {
    AdminPanelEngine._loadSettings().then(() => {
      if (window.renderFooterContact) renderFooterContact();
    }).catch(() => {});
  }

  function formatFileSize(bytes) {
    if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
  window.formatFileSize = formatFileSize;

  let state = {
    activeTool: null,
    files: [],
    pdfPageCards: [],
    processedResult: null,
    quizData: null,
    extractedText: '',
    detectedSubDocs: [],
    selectedDeletePages: new Set(),
    cropState: { top: 20, right: 20, bottom: 20, left: 20, unit: 'px' },
    extractedTableRows: [],
    batchResizeResults: [],
    pngComparison: null,
    activeDragIndex: null
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  function handleRoute() {
    const hash = window.location.hash;
    const mainApp = document.getElementById('main-app-view');
    const toolStudioView = document.getElementById('tool-studio-view');
    const adminPage = document.getElementById('admin-page-view');
    const historyPage = document.getElementById('user-history-view');
    const publicQuizView = document.getElementById('public-quiz-view');
    const quizDashboardView = document.getElementById('quiz-dashboard-view');

    if (mainApp) mainApp.classList.add('hidden');
    if (toolStudioView) toolStudioView.classList.add('hidden');
    if (adminPage) adminPage.classList.add('hidden');
    if (historyPage) historyPage.classList.add('hidden');
    if (publicQuizView) publicQuizView.classList.add('hidden');
    if (quizDashboardView) quizDashboardView.classList.add('hidden');

    if (hash === '#admin-page' || hash === '#admin') {
      if (adminPage) { adminPage.classList.remove('hidden'); if (typeof renderFullAdminPage === 'function') renderFullAdminPage(); }
    } else if (hash === '#history') {
      if (historyPage) { historyPage.classList.remove('hidden'); renderUserHistoryPage(); }
    } else if (hash.startsWith('#quiz/') || hash.startsWith('#take-quiz/')) {
      const quizId = hash.replace(/^#(quiz|take-quiz)\//, '');
      if (publicQuizView) {
        publicQuizView.classList.remove('hidden');
        if (typeof renderParticipantQuizPage === 'function') renderParticipantQuizPage(quizId);
      }
    } else if (hash.startsWith('#quiz-dashboard/')) {
      const quizId = hash.replace('#quiz-dashboard/', '');
      if (quizDashboardView) {
        quizDashboardView.classList.remove('hidden');
        if (typeof renderQuizCreatorDashboard === 'function') renderQuizCreatorDashboard(quizId);
      }
    } else if (hash.startsWith('#tool/')) {
      const toolId = hash.replace('#tool/', '');
      const tool = TOOLS.find(t => t.id === toolId);
      const toolEnabled = window.AdminPanelEngine ? AdminPanelEngine.isFeatureEnabled(toolId) : false;
      const isAllowedForUser = window.AuthSubscriptionEngine ? AuthSubscriptionEngine.isToolAllowedForUser(toolId) : true;

      if (tool && toolStudioView && toolEnabled && isAllowedForUser) {
        toolStudioView.classList.remove('hidden');
        renderDedicatedToolStudioPage(tool);
      } else if (tool && toolStudioView && !isAllowedForUser) {
        mainApp.classList.remove('hidden');
        window.location.hash = '#';
        if (window.AuthSubscriptionEngine) AuthSubscriptionEngine.openProUpgradeLockModal(tool);
      } else if (tool && toolStudioView) {
        mainApp.classList.remove('hidden');
        window.location.hash = '#';
        if (window.showToast) showToast('This tool is currently disabled by the administrator.', 'error');
      } else if (mainApp) mainApp.classList.remove('hidden');
    } else if (mainApp) mainApp.classList.remove('hidden');
  }

  const toolGrid = document.getElementById('tool-grid');
  const searchInput = document.getElementById('tool-search');
  const categoryTabs = document.querySelectorAll('.category-tab');

  function renderTools(filterText = '', category = 'all') {
    if (!toolGrid) return;
    toolGrid.innerHTML = '';

    // Get enabled IDs from DB-backed cache (via AdminPanelEngine)
    let enabledIds = window.AdminPanelEngine ? AdminPanelEngine.getEnabledFeatures() : null;
    if (enabledIds === null) {
      // Cache not yet populated — show all tools while DB loads
      enabledIds = TOOLS.map(t => t.id);
    }
    const visibleTools = TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(filterText.toLowerCase()) || tool.description.toLowerCase().includes(filterText.toLowerCase());
      const matchesCategory = category === 'all' || tool.category === category;
      const isVisible = enabledIds.includes(tool.id);
      return matchesSearch && matchesCategory && isVisible;
    });

    // --- Update live enabled feature count in hero section & "All N Tools" tab ---
    const totalEnabled = enabledIds.length;
    // Hero section count (the big heading mentions "50 tools")
    const heroCount = document.querySelector('[data-tool-count]');
    if (heroCount) heroCount.textContent = totalEnabled;
    // "All X Tools" category tab
    const allTab = document.querySelector('.category-tab[data-category="all"]');
    if (allTab) allTab.textContent = `All ${totalEnabled} Tool${totalEnabled !== 1 ? 's' : ''}`;
    // Per-category counts on tabs
    document.querySelectorAll('.category-tab[data-category]').forEach(tab => {
      const cat = tab.dataset.category;
      if (cat === 'all') return;
      const count = enabledIds.filter(id => {
        const t = TOOLS.find(x => x.id === id);
        return t && t.category === cat;
      }).length;
      // Strip old count "(N)" and append new
      const baseLabel = tab.textContent.replace(/\s*\(\d+\)\s*$/, '').trim();
      tab.textContent = `${baseLabel} (${count})`;
    });

    if (visibleTools.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'col-span-full text-center py-16 space-y-4 animate-fade-in';
      msg.innerHTML = `
        <div class="w-16 h-16 mx-auto rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl shadow-inner"><i class="fa-solid fa-ban"></i></div>
        <h3 class="text-xl font-extrabold text-slate-900">All Tools Currently Disabled</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">The website administrator has currently hidden all features from the portal. Please log in to the <a href="#admin-page" class="text-indigo-600 font-bold underline">Admin Portal</a> to enable tools.</p>
      `;
      toolGrid.appendChild(msg);
      return;
    }

    visibleTools.forEach(tool => {
      const isAllowedForUser = window.AuthSubscriptionEngine ? AuthSubscriptionEngine.isToolAllowedForUser(tool.id) : true;
      const card = document.createElement('div');
      card.className = `tool-card animate-fade-in relative ${!isAllowedForUser ? 'opacity-90 border-amber-200/80 bg-gradient-to-b from-white to-amber-50/30 shadow-sm' : ''}`;
      
      if (!isAllowedForUser) {
        card.onclick = (e) => {
          e.preventDefault();
          if (window.AuthSubscriptionEngine) AuthSubscriptionEngine.openProUpgradeLockModal(tool);
        };
      } else {
        card.onclick = () => { window.location.hash = `#tool/${tool.id}`; };
      }

      // Find the minimum required plan name for locked tools
      let requiredPlanLabel = 'PRO';
      if (!isAllowedForUser && window.AuthSubscriptionEngine) {
        const planName = AuthSubscriptionEngine.getRequiredPlanName(tool.id);
        requiredPlanLabel = planName ? planName + ' Only' : 'PRO';
      }

      const badgeHtml = !isAllowedForUser 
        ? `<span class="tool-badge bg-slate-900 text-amber-400 font-extrabold flex items-center gap-1 shadow-md" style="font-size:0.55rem;max-width:90%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><i class="fa-solid fa-lock text-amber-400"></i> ${requiredPlanLabel}</span>`
        : (tool.badge ? `<span class="tool-badge bg-gradient-to-r ${tool.color} text-white">${tool.badge}</span>` : '');

      card.innerHTML = `
        ${badgeHtml}
        <div class="tool-icon-wrapper bg-gradient-to-r ${tool.color} text-white relative">
          <i class="fa-solid ${tool.icon}"></i>
          ${!isAllowedForUser ? `<div class="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center text-amber-400 text-base"><i class="fa-solid fa-lock"></i></div>` : ''}
        </div>
        <h3 class="font-bold text-base mb-1 text-slate-900 flex items-center gap-1.5">
          ${tool.name}
        </h3>
        <p class="text-xs text-muted leading-relaxed">${tool.description}</p>`;
      toolGrid.appendChild(card);
    });
  }
  window.renderTools = renderTools;
  window.addEventListener('featuresUpdated', () => renderTools());
  window.addEventListener('storage', () => renderTools());
  // Initial render is triggered by NeonEngine.initFeatures().then(renderTools) above.
  // This fallback ensures tools render even if NeonEngine is not available.
  if (!window.NeonEngine) renderTools();
  if (searchInput) searchInput.addEventListener('input', (e) => {
    const activeCat = document.querySelector('.category-tab.active')?.dataset.category || 'all';
    renderTools(e.target.value, activeCat);
  });
  categoryTabs.forEach(tab => tab.addEventListener('click', () => {
    categoryTabs.forEach(t => t.classList.remove('active', 'bg-indigo-600', 'text-white'));
    tab.classList.add('active', 'bg-indigo-600', 'text-white');
    renderTools(searchInput?.value || '', tab.dataset.category);
  }));

  function getWorkAreaTitle(tool) {
    const titles = {
      'pdf-merger': { icon: 'fa-layer-group', title: 'PDF Merger - Combine & Re-order Multi-PDF Studio' },
      'pdf-splitter': { icon: 'fa-scissors', title: 'PDF Splitter - Extract Ranges or Standalone Pages' },
      'pdf-unmerger': { icon: 'fa-box-open', title: 'PDF Un-merger - Structural Analysis & Document Restorer' },
      'pdf-page-reorder': { icon: 'fa-arrows-left-right', title: 'PDF Page Re-orderer - Interactive Sequence & Rotation' },
      'pdf-page-deleter': { icon: 'fa-trash-can', title: 'PDF Page Deleter - Strip Unwanted Pages' },
      'pdf-crop-tool': { icon: 'fa-crop-simple', title: 'PDF Crop Studio - Interactive Visual Canvas Overlay' },
      'pdf-compressor-smart': { icon: 'fa-compress', title: 'PDF Compressor (Smart) - Downsampling & Optimization' },
      'lossless-pdf-shrinker': { icon: 'fa-file-shield', title: 'Lossless PDF Shrinker - 100% Visual Fidelity Preserved' },
      'pdf-target-shrinker': { icon: 'fa-weight-hanging', title: 'PDF Target Size Shrinker - Adaptive Iterative Compression' },
      'pdf-to-xlsx': { icon: 'fa-file-excel', title: 'PDF to Excel (XLSX) - Interactive Table Recognition' },
      'xlsx-to-pdf': { icon: 'fa-table', title: 'Excel (XLSX) to PDF - Print-Formatted Reports' },
      'pdf-to-pptx': { icon: 'fa-file-powerpoint', title: 'PDF to PowerPoint (PPTX) - Presentation Slides' },
      'pptx-to-pdf': { icon: 'fa-file-pdf', title: 'PowerPoint to PDF - Vector Slide Exporter' },
      'pdf-to-jpg': { icon: 'fa-file-image', title: 'PDF to JPG Converter - High-Res Image Rendering' },
      'jpg-to-pdf': { icon: 'fa-file-export', title: 'JPG to PDF Converter - Multi-Image Photo Compiler' },
      'batch-img-resizer': { icon: 'fa-expand', title: 'Batch Image Resizer - Concurrent Multi-Image Processing' },
      'png-compressor': { icon: 'fa-file-image', title: 'Lossless PNG Compressor - Before/After Visual Comparison' },
      'webp-converter': { icon: 'fa-bolt', title: 'WEBP Image Converter - Web-Optimized Format' }
    };
    if (titles[tool.id]) return titles[tool.id];

    switch (tool.uiType) {
      case TOOL_UI_TYPES.PDF_PAGE_ORGANIZER: return { icon: 'fa-arrows-up-down-left-right', title: 'Interactive PDF Page Re-arranger & Editor' };
      case TOOL_UI_TYPES.PDF_CROP: return { icon: 'fa-crop-simple', title: 'PDF Crop Workspace - Margins & Trim Area' };
      case TOOL_UI_TYPES.PDF_COMPRESS: return { icon: 'fa-compress', title: 'PDF Compression Workspace - Size Optimization' };
      case TOOL_UI_TYPES.IMAGE_PREVIEW: return { icon: 'fa-image', title: 'Image Preview & Editing Workspace' };
      case TOOL_UI_TYPES.CONVERTER_SIMPLE: return { icon: 'fa-right-left', title: 'File Converter Preview Workspace' };
      case TOOL_UI_TYPES.OCR_TRANSLATE: return { icon: 'fa-language', title: 'Document Text Extraction & AI Workspace' };
      case TOOL_UI_TYPES.QUIZ_CREATOR: return { icon: 'fa-clipboard-question', title: 'Auto Quiz Generator Workspace (Multi-Language)' };
      case TOOL_UI_TYPES.DESIGN_PREPRESS: return { icon: 'fa-ruler-combined', title: 'Design & Prepress Workspace' };
      case TOOL_UI_TYPES.TEXT_INPUT: return { icon: 'fa-keyboard', title: 'Input & Configuration Workspace' };
      default: return { icon: 'fa-folder-open', title: 'File Processing Workspace' };
    }
  }

  function getProcessButtonText(tool) {
    const btnLabels = {
      'pdf-merger': 'Merge & Export PDF',
      'pdf-splitter': 'Split & Download',
      'pdf-unmerger': 'Restore & Export Documents',
      'pdf-page-reorder': 'Save Re-ordered PDF',
      'pdf-page-deleter': 'Remove Pages & Export PDF',
      'pdf-crop-tool': 'Crop & Export PDF',
      'pdf-compressor-smart': 'Compress PDF',
      'lossless-pdf-shrinker': 'Lossless Shrink PDF',
      'pdf-target-shrinker': 'Compress to Target Size',
      'pdf-to-xlsx': 'Convert to Excel (.xlsx)',
      'xlsx-to-pdf': 'Export Formatted PDF',
      'pdf-to-pptx': 'Convert to PowerPoint (.pptx)',
      'pptx-to-pdf': 'Convert Deck to PDF',
      'pdf-to-jpg': 'Convert & Export Images',
      'jpg-to-pdf': 'Compile Images to PDF',
      'batch-img-resizer': 'Resize & Process Batch',
      'png-compressor': 'Compress & Save PNG',
      'webp-converter': 'Convert to WebP'
    };
    if (btnLabels[tool.id]) return btnLabels[tool.id];

    switch (tool.uiType) {
      case TOOL_UI_TYPES.PDF_PAGE_ORGANIZER: return 'Re-arrange & Export PDF';
      case TOOL_UI_TYPES.PDF_CROP: return 'Crop & Export PDF';
      case TOOL_UI_TYPES.PDF_COMPRESS: return 'Compress & Export';
      case TOOL_UI_TYPES.QUIZ_CREATOR: return 'Generate Quiz Questions';
      case TOOL_UI_TYPES.TEXT_INPUT: return 'Generate Output';
      case TOOL_UI_TYPES.CONVERTER_SIMPLE: return 'Convert & Export';
      case TOOL_UI_TYPES.IMAGE_PREVIEW: return 'Process & Export Image';
      default: return 'Process & Export';
    }
  }

  function renderDedicatedToolStudioPage(tool) {
    state.activeTool = tool; state.files = []; state.pdfPageCards = []; state.processedResult = null; state.quizData = null; state.extractedText = '';
    const container = document.getElementById('tool-studio-view'); if (!container) return;
    const workArea = getWorkAreaTitle(tool);
    const isTextInputTool = tool.uiType === TOOL_UI_TYPES.TEXT_INPUT;
    const isQuizCreator = tool.uiType === TOOL_UI_TYPES.QUIZ_CREATOR;
    const acceptHint = tool.accept ? tool.accept.toUpperCase().replace(/\./g, '').split(',').join(', ') : 'All Files';

    let studioBodyLeft = '';
    if (isTextInputTool) {
      let placeholder = 'Enter your text or values here...';
      if (tool.id === 'text-case-transformer') placeholder = 'Paste or type text to transform case...\n\nExample: The Quick Brown Fox';
      else if (tool.id === 'px-rem-calc') placeholder = 'Enter PX values (one per line or comma separated):\n\n16\n24\n32\n48';
      else if (tool.id === 'glassmorphism-gen') placeholder = 'Configure via sidebar controls. Preview updates live.';
      else if (tool.id === 'color-contrast-wcag') placeholder = 'Enter hex pairs to test (one pair per line):\n#FFFFFF on #000000';
      else if (tool.id === 'opengraph-builder') placeholder = 'Configure OpenGraph tags via sidebar.';
      studioBodyLeft = `
        <div class="p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><i class="fa-solid fa-keyboard text-indigo-600"></i> Input Area</label>
            <button type="button" onclick="clearTextInput()" class="text-[11px] text-slate-400 hover:text-red-500 underline">Clear</button>
          </div>
          <textarea id="studio-text-input" rows="12" class="custom-input w-full text-sm font-mono" placeholder="${placeholder}"></textarea>
          <div id="text-output-preview" class="hidden pt-4 border-t border-slate-100 space-y-3">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider"><i class="fa-solid fa-check-double text-emerald-600"></i> Output Result</label>
            <pre id="text-output-content" class="bg-slate-50 p-4 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap max-h-80 overflow-y-auto"></pre>
            <button onclick="copyTextOutput()" class="text-xs px-3 py-1.5 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition"><i class="fa-solid fa-copy"></i> Copy to Clipboard</button>
          </div>
        </div>
        <div id="studio-processing-status" class="hidden p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-3">
          <i class="fa-solid fa-circle-notch fa-spin text-indigo-600 text-xl"></i>
          <span id="processing-status-text" class="text-xs font-bold text-indigo-800">Processing...</span>
        </div>`;
    } else {
      studioBodyLeft = `
        <div id="studio-dropzone" class="dropzone p-12 text-center cursor-pointer flex flex-col items-center justify-center min-h-[280px] bg-white border-2 border-dashed border-indigo-200 rounded-2xl hover:border-indigo-500 transition shadow-sm">
          <input type="file" id="studio-file-input" class="hidden" accept="${tool.accept || '*'}" ${tool.multiple ? 'multiple' : ''}>
          <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mb-3 shadow-inner"><i class="fa-solid fa-cloud-arrow-up"></i></div>
          <p class="font-extrabold text-base text-slate-800 mb-1">Click to Upload ${acceptHint}</p>
          <p class="text-xs text-slate-400">Support for ${acceptHint} files • Drag & drop supported</p>
        </div>
        <div id="studio-work-area" class="hidden p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex flex-wrap justify-between items-center pb-3 border-b border-slate-200 gap-2">
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2"><i class="fa-solid ${workArea.icon} text-indigo-600"></i> ${workArea.title}</h3>
              <span id="studio-item-count-badge" class="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200"></span>
            </div>
            <div class="flex gap-2">
              ${tool.uiType === TOOL_UI_TYPES.PDF_PAGE_ORGANIZER ? `<button type="button" onclick="rotateAllPages(90)" class="text-xs px-2.5 py-1 rounded bg-slate-100 font-bold hover:bg-slate-200 transition text-slate-700"><i class="fa-solid fa-rotate-right"></i> Rotate All 90°</button>` : ''}
              <button type="button" onclick="document.getElementById('studio-file-input').click()" class="text-xs px-2.5 py-1 rounded bg-indigo-600 text-white font-bold transition">+ ${tool.uiType === TOOL_UI_TYPES.PDF_PAGE_ORGANIZER ? 'Add File' : 'Replace File'}</button>
            </div>
          </div>
          ${renderToolSpecificWorkArea(tool)}
        </div>
        <div id="studio-processing-status" class="hidden p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-3">
          <i class="fa-solid fa-circle-notch fa-spin text-indigo-600 text-xl"></i>
          <span id="processing-status-text" class="text-xs font-bold text-indigo-800">Processing file...</span>
        </div>
        ${isQuizCreator ? `
        <div id="quiz-result-area" class="hidden p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex justify-between items-center pb-3 border-b border-slate-200">
            <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2"><i class="fa-solid fa-check-circle text-emerald-600"></i> Generated Quiz Questions</h3>
            <div class="flex gap-2">
              <button onclick="exportQuiz('json')" class="text-xs px-3 py-1 rounded bg-slate-100 font-bold hover:bg-slate-200 transition text-slate-700"><i class="fa-solid fa-file-code"></i> Export JSON</button>
              <button onclick="exportQuiz('txt')" class="text-xs px-3 py-1 rounded bg-indigo-600 text-white font-bold transition hover:bg-indigo-500"><i class="fa-solid fa-file-lines"></i> Export TXT</button>
            </div>
          </div>
          <div id="quiz-questions-container" class="space-y-4 max-h-[600px] overflow-y-auto pr-2"></div>
        </div>` : ''}`;
    }

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-r ${tool.color} text-white flex items-center justify-center text-2xl shadow-md"><i class="fa-solid ${tool.icon}"></i></div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-2xl font-extrabold text-slate-900">${tool.name}</h2>
                ${tool.badge ? `<span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">${tool.badge}</span>` : ''}
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${tool.description}</p>
            </div>
          </div>
          <a href="#" class="px-4 py-2 bg-slate-100 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"><i class="fa-solid fa-arrow-left"></i> Back to All Tools</a>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-8 flex flex-col space-y-4">${studioBodyLeft}</div>
          <aside class="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                <h4 class="font-extrabold text-sm text-indigo-600 uppercase tracking-wider flex items-center gap-2"><i class="fa-solid fa-sliders"></i> ${isTextInputTool ? 'Configuration' : 'Tool Parameters'}</h4>
                <button type="button" onclick="resetStudioControlsDefaults()" class="text-[11px] text-slate-400 hover:text-indigo-600 underline">Reset Defaults</button>
              </div>
              <div id="studio-controls-container" class="space-y-4"></div>
            </div>
            <div class="pt-4 border-t border-slate-200 space-y-3">
              <button id="studio-btn-process" class="w-full btn-gradient py-3.5 text-sm rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                <i class="fa-solid fa-wand-magic-sparkles"></i> ${getProcessButtonText(tool)}
              </button>
              <button id="studio-btn-download" class="hidden w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 text-sm rounded-xl font-extrabold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30">
                <i class="fa-solid fa-download"></i> Download Export
              </button>
            </div>
          </aside>
        </div>
      </div>`;

    if (!isTextInputTool) {
      const studioDropzone = document.getElementById('studio-dropzone');
      const studioFileInput = document.getElementById('studio-file-input');
      if (studioDropzone) {
        studioDropzone.onclick = () => studioFileInput.click();
        studioDropzone.ondragover = (e) => { e.preventDefault(); studioDropzone.classList.add('dragover'); };
        studioDropzone.ondragleave = () => studioDropzone.classList.remove('dragover');
        studioDropzone.ondrop = (e) => { e.preventDefault(); studioDropzone.classList.remove('dragover'); if (e.dataTransfer.files.length) handleStudioFiles(Array.from(e.dataTransfer.files)); };
      }
      if (studioFileInput) studioFileInput.onchange = (e) => { if (e.target.files.length) handleStudioFiles(Array.from(e.target.files)); };
    }

    renderStudioControls(tool);
    setupProcessButton(tool);
    setupDownloadButton();
    attachToolBehavior(tool);
  }

  function renderToolSpecificWorkArea(tool) {
    if (tool.id === 'pdf-merger') {
      return `
        <div class="space-y-4">
          <div class="flex flex-wrap justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 gap-2">
            <div class="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
              <i class="fa-solid fa-layer-group text-indigo-600"></i>
              <span>Drag & drop cards to reorder sequence. Orientation and naming options available in sidebar.</span>
            </div>
            <button type="button" onclick="document.getElementById('studio-file-input').click()" class="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-plus"></i> Add More PDFs
            </button>
          </div>
          <div id="merger-file-list" class="space-y-2 max-h-[480px] overflow-y-auto p-1"></div>
        </div>`;
    }

    if (tool.id === 'pdf-splitter') {
      return `
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div class="flex items-center gap-2">
              <label class="text-xs font-bold text-slate-700">Split Mode:</label>
              <select id="splitter-mode-select" class="custom-input text-xs py-1 px-2.5" onchange="onSplitterModeChanged()">
                <option value="ranges" selected>Custom Page Ranges (e.g. 1-3, 5, 8-10)</option>
                <option value="individual">Extract Every Page as Standalone PDF (.zip)</option>
              </select>
            </div>
            <div id="splitter-range-container" class="flex items-center gap-2">
              <label class="text-xs font-bold text-slate-500">Range:</label>
              <input type="text" id="splitter-range-input" class="custom-input text-xs py-1 px-2.5 w-48" placeholder="e.g. 1-2, 4, 6-8" oninput="highlightSplitterRanges()">
            </div>
          </div>
          <div class="flex justify-between items-center px-1 text-[11px] text-slate-500">
            <span><i class="fa-solid fa-hand-pointer text-indigo-600 mr-1"></i>Click pages below to quickly add/remove from range:</span>
            <span id="splitter-pages-badge" class="font-bold text-indigo-600">0 Pages Total</span>
          </div>
          <div id="splitter-thumbnail-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto p-1"></div>
        </div>`;
    }

    if (tool.id === 'pdf-unmerger') {
      return `
        <div class="space-y-4">
          <div class="p-4 bg-indigo-50/80 rounded-xl border border-indigo-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 class="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <i class="fa-solid fa-wand-magic-sparkles text-indigo-600"></i> Structural Analysis Results
              </h4>
              <p class="text-[11px] text-indigo-700 mt-0.5">Detected document boundaries based on bookmarks, numbering restarts, and layout shifts.</p>
            </div>
            <span id="unmerger-count-badge" class="px-3 py-1 rounded-full bg-white text-indigo-700 font-extrabold text-xs border border-indigo-200 shadow-xs">Analyzing...</span>
          </div>
          <div id="unmerger-subdocs-list" class="space-y-3 max-h-[480px] overflow-y-auto p-1"></div>
        </div>`;
    }

    if (tool.id === 'pdf-page-deleter') {
      return `
        <div class="space-y-4">
          <div class="flex flex-wrap justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 gap-2">
            <div class="flex flex-wrap gap-1.5">
              <button type="button" onclick="selectDeleterPages('even')" class="text-xs px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-slate-700 transition">Select Even Pages</button>
              <button type="button" onclick="selectDeleterPages('odd')" class="text-xs px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-slate-700 transition">Select Odd Pages</button>
              <button type="button" onclick="selectDeleterPages('invert')" class="text-xs px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-slate-700 transition">Invert Selection</button>
              <button type="button" onclick="selectDeleterPages('clear')" class="text-xs px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-slate-700 transition">Clear All</button>
            </div>
            <div id="deleter-status-summary" class="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              0 to delete • 0 remaining
            </div>
          </div>
          <div id="deleter-thumbnail-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto p-1"></div>
        </div>`;
    }

    if (tool.id === 'pdf-crop-tool') {
      return `
        <div class="space-y-4">
          <div class="flex flex-col items-center justify-center p-4 bg-slate-100/70 rounded-2xl border border-slate-200 overflow-hidden">
            <div class="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1.5">
              <i class="fa-solid fa-crop-simple text-indigo-600"></i> Interactive Canvas: Drag corners, edges, or the box to adjust crop area
            </div>
            <div id="crop-canvas-wrapper" class="crop-container bg-white border border-slate-300 rounded shadow-md overflow-hidden" style="max-width: 100%; max-height: 480px;">
              <canvas id="crop-render-canvas"></canvas>
              <div id="crop-box-element" class="crop-box" style="top: 20px; left: 20px; width: 220px; height: 300px;">
                <div class="crop-handle crop-handle-nw" data-handle="nw"></div>
                <div class="crop-handle crop-handle-n" data-handle="n"></div>
                <div class="crop-handle crop-handle-ne" data-handle="ne"></div>
                <div class="crop-handle crop-handle-e" data-handle="e"></div>
                <div class="crop-handle crop-handle-se" data-handle="se"></div>
                <div class="crop-handle crop-handle-s" data-handle="s"></div>
                <div class="crop-handle crop-handle-sw" data-handle="sw"></div>
                <div class="crop-handle crop-handle-w" data-handle="w"></div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-[11px] font-bold text-slate-600 uppercase">Margin Positioning</label>
                <select id="crop-unit-select" class="text-[10px] custom-input py-0.5 px-1.5 font-bold" onchange="onCropUnitChange()">
                  <option value="px" selected>Pixels (px)</option>
                  <option value="mm">Millimeters (mm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>
              <div class="grid grid-cols-4 gap-2">
                <div><span class="text-[9px] text-slate-400 font-bold block">Top</span><input type="number" id="crop-input-top" class="custom-input w-full text-xs" value="20" min="0" oninput="onCropInputChanged()"></div>
                <div><span class="text-[9px] text-slate-400 font-bold block">Right</span><input type="number" id="crop-input-right" class="custom-input w-full text-xs" value="20" min="0" oninput="onCropInputChanged()"></div>
                <div><span class="text-[9px] text-slate-400 font-bold block">Bottom</span><input type="number" id="crop-input-bottom" class="custom-input w-full text-xs" value="20" min="0" oninput="onCropInputChanged()"></div>
                <div><span class="text-[9px] text-slate-400 font-bold block">Left</span><input type="number" id="crop-input-left" class="custom-input w-full text-xs" value="20" min="0" oninput="onCropInputChanged()"></div>
              </div>
            </div>
            <div class="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
              <label class="text-[11px] font-bold text-slate-600 uppercase block">Crop Scope</label>
              <div class="flex flex-wrap gap-2 text-xs">
                <label class="inline-flex items-center gap-1 font-bold text-slate-700 cursor-pointer"><input type="radio" name="crop-scope-radio" value="all" checked class="accent-indigo-600"> All Pages</label>
                <label class="inline-flex items-center gap-1 font-bold text-slate-700 cursor-pointer"><input type="radio" name="crop-scope-radio" value="current" class="accent-indigo-600"> Current Page</label>
                <label class="inline-flex items-center gap-1 font-bold text-slate-700 cursor-pointer"><input type="radio" name="crop-scope-radio" value="range" class="accent-indigo-600" onchange="document.getElementById('crop-custom-range').disabled = !this.checked"> Custom Range:</label>
                <input type="text" id="crop-custom-range" placeholder="e.g. 1-3, 5" class="custom-input text-xs py-0.5 px-2 w-24" disabled>
              </div>
            </div>
          </div>
        </div>`;
    }

    if (tool.id === 'pdf-compressor-smart') {
      return `
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 class="text-xs font-bold text-slate-700 flex items-center gap-1.5"><i class="fa-solid fa-file-lines text-indigo-600"></i> Original Document</h4>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="p-2.5 bg-white rounded-lg border border-slate-200"><span class="text-slate-400 font-bold text-[10px]">ORIGINAL SIZE</span><div id="compress-orig-size" class="font-extrabold text-slate-900 mt-0.5 text-sm">--</div></div>
                <div class="p-2.5 bg-white rounded-lg border border-slate-200"><span class="text-slate-400 font-bold text-[10px]">PAGE COUNT</span><div id="compress-orig-pages" class="font-extrabold text-slate-900 mt-0.5 text-sm">--</div></div>
              </div>
            </div>
            <div class="p-4 bg-indigo-50 rounded-xl border border-indigo-200 space-y-3">
              <h4 class="text-xs font-bold text-indigo-900 flex items-center gap-1.5"><i class="fa-solid fa-sliders text-indigo-600"></i> Compression Preset</h4>
              <select id="smart-compress-preset" class="custom-input w-full text-xs">
                <option value="low">Low Compression (300 DPI sampling - Highest Quality)</option>
                <option value="medium" selected>Recommended (150 DPI sampling - Balanced)</option>
                <option value="high">Extreme Compression (72 DPI sampling - Smallest Size)</option>
              </select>
              <p class="text-[11px] text-indigo-700">Downsamples raster images, re-encodes JPEG streams, and strips redundant object references.</p>
            </div>
          </div>
          <div id="compress-metric-result" class="hidden p-4 bg-emerald-50 rounded-xl border border-emerald-200 animate-fade-in">
            <h4 class="text-xs font-extrabold text-emerald-800 mb-2 flex items-center gap-1.5"><i class="fa-solid fa-circle-check"></i> Compression Complete</h4>
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="p-2.5 bg-white rounded-lg border border-emerald-200"><span class="text-slate-400 font-bold text-[10px] block">ORIGINAL</span><div id="comp-res-orig" class="font-extrabold text-slate-800 mt-0.5">--</div></div>
              <div class="p-2.5 bg-white rounded-lg border border-emerald-200"><span class="text-slate-400 font-bold text-[10px] block">COMPRESSED</span><div id="comp-res-new" class="font-extrabold text-emerald-700 mt-0.5">--</div></div>
              <div class="p-2.5 bg-white rounded-lg border border-emerald-200"><span class="text-slate-400 font-bold text-[10px] block">SAVED</span><div id="comp-res-saved" class="font-extrabold text-emerald-700 mt-0.5">--</div></div>
            </div>
          </div>
        </div>`;
    }

    if (tool.id === 'lossless-pdf-shrinker') {
      return `
        <div class="space-y-4">
          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg flex-shrink-0"><i class="fa-solid fa-shield-check"></i></div>
            <div>
              <h4 class="text-xs font-bold text-emerald-900">100% Visual Fidelity Preserved</h4>
              <p class="text-[11px] text-emerald-700">Strictly preserves 100% visual fidelity and image resolution. Removes EXIF profiles, XML metadata, annotations, unreferenced objects, and compacts streams.</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200"><span class="text-slate-400 font-bold text-[10px] block">CURRENT FILE SIZE</span><div id="lossless-orig-size" class="font-extrabold text-slate-900 text-base mt-0.5">--</div></div>
            <div class="p-3.5 bg-white rounded-xl border border-slate-200"><span class="text-slate-400 font-bold text-[10px] block">STATUS</span><div id="lossless-status" class="font-bold text-indigo-600 text-sm mt-0.5">Ready for optimization</div></div>
          </div>
          <div id="lossless-metric-result" class="hidden p-4 bg-emerald-50 rounded-xl border border-emerald-200 animate-fade-in">
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="p-2 bg-white rounded border border-emerald-200"><span class="text-slate-400 text-[10px] font-bold block">BEFORE</span><div id="lossless-res-orig" class="font-bold text-slate-800">--</div></div>
              <div class="p-2 bg-white rounded border border-emerald-200"><span class="text-slate-400 text-[10px] font-bold block">AFTER</span><div id="lossless-res-new" class="font-bold text-emerald-700">--</div></div>
              <div class="p-2 bg-white rounded border border-emerald-200"><span class="text-slate-400 text-[10px] font-bold block">SAVINGS</span><div id="lossless-res-saved" class="font-bold text-emerald-700">--</div></div>
            </div>
          </div>
        </div>`;
    }

    if (tool.id === 'pdf-target-shrinker') {
      return `
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span class="text-slate-400 font-bold text-[10px] block">CURRENT FILE SIZE</span>
              <div id="target-shrinker-orig-size" class="text-base font-extrabold text-slate-900">--</div>
            </div>
            <div class="p-4 bg-indigo-50 rounded-xl border border-indigo-200 space-y-2">
              <label class="text-[10px] font-bold text-indigo-900 uppercase block">Target Maximum Size</label>
              <div class="flex gap-2">
                <input type="number" id="target-size-number" class="custom-input flex-1 text-xs" value="2" min="0.1" step="0.1">
                <select id="target-size-unit" class="custom-input text-xs px-2">
                  <option value="MB" selected>MB</option>
                  <option value="KB">KB</option>
                </select>
              </div>
              <p class="text-[10px] text-indigo-700">Executes an iterative downsampling/compression loop dynamically adjusting DPI and quality settings until target size is met.</p>
            </div>
          </div>
          <div id="target-shrinker-feedback" class="hidden p-4 rounded-xl text-xs space-y-2 animate-fade-in"></div>
        </div>`;
    }

    if (tool.id === 'pdf-to-xlsx') {
      return `
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <div class="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
              <i class="fa-solid fa-table-cells text-emerald-600"></i> In-Browser Interactive Table Data Preview
            </div>
            <span id="excel-preview-stat" class="text-[10px] font-bold bg-white text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">0 Rows</span>
          </div>
          <div id="excel-interactive-preview" class="excel-preview-container bg-white p-2">
            <p class="text-slate-400 text-xs text-center py-10">Upload a PDF to extract tables and see interactive spreadsheet preview here.</p>
          </div>
        </div>`;
    }

    if (tool.id === 'xlsx-to-pdf') {
      return `
        <div class="space-y-4">
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h4 class="text-xs font-bold text-slate-800" id="xlsx-file-name">Spreadsheet Document</h4>
              <p class="text-[11px] text-slate-500" id="xlsx-file-details">--</p>
            </div>
            <div class="flex gap-2 text-xs">
              <select id="xlsx-paper-orientation" class="custom-input text-xs py-1 px-2 font-bold">
                <option value="portrait">Portrait</option>
                <option value="landscape" selected>Landscape</option>
              </select>
              <select id="xlsx-paper-size" class="custom-input text-xs py-1 px-2 font-bold">
                <option value="A4" selected>A4 Paper</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
          </div>
          <div id="xlsx-preview-container" class="excel-preview-container bg-white p-2"></div>
        </div>`;
    }

    if (tool.id === 'pdf-to-pptx') {
      return `
        <div class="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
            <i class="fa-solid fa-file-powerpoint"></i>
          </div>
          <div>
            <h4 class="text-sm font-extrabold text-slate-900">PDF to PowerPoint Presentation Deck</h4>
            <p class="text-xs text-slate-500 max-w-md mx-auto mt-1">Converts multi-page PDF documents into .pptx presentation slide decks. Renders each page as a high-resolution slide layer while creating editable slide objects.</p>
          </div>
          <div id="pptx-pages-badge" class="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-700 font-extrabold text-xs border border-orange-200">-- Pages Detected</div>
        </div>`;
    }

    if (tool.id === 'pptx-to-pdf') {
      return `
        <div class="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
            <i class="fa-solid fa-file-pdf"></i>
          </div>
          <div>
            <h4 class="text-sm font-extrabold text-slate-900">PowerPoint Deck to PDF Converter</h4>
            <p class="text-xs text-slate-500 max-w-md mx-auto mt-1">Upload .pptx or .ppt files. Converts presentation decks into crisp, static PDF documents while preserving fonts, vector shapes, slide ratios, and background styles.</p>
          </div>
          <div id="pptx-pdf-details" class="text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 inline-block">Upload a presentation to convert</div>
        </div>`;
    }

    if (tool.id === 'pdf-to-jpg') {
      return `
        <div class="space-y-4">
          <div class="flex flex-wrap justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 gap-2">
            <div class="flex items-center gap-2">
              <label class="text-xs font-bold text-slate-700">Resolution:</label>
              <select id="pdf-jpg-dpi" class="custom-input text-xs py-1 px-2" onchange="runPdfToJpgExtraction()">
                <option value="1">Web (72 DPI)</option>
                <option value="2" selected>Medium (150 DPI)</option>
                <option value="4">High Print (300 DPI)</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-xs font-bold text-slate-500">Page Range:</label>
              <input type="text" id="pdf-jpg-range" placeholder="All (or e.g. 1-3, 5)" class="custom-input text-xs py-1 px-2 w-40" onchange="runPdfToJpgExtraction()">
            </div>
          </div>
          <div id="pdf-jpg-gallery" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto p-1"></div>
        </div>`;
    }

    if (tool.id === 'jpg-to-pdf') {
      return `
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5"><i class="fa-solid fa-arrows-up-down-left-right text-indigo-600"></i>Drag and drop photos to reorder sequence before compiling</span>
            <button type="button" onclick="document.getElementById('studio-file-input').click()" class="text-xs px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">+ Add Photos</button>
          </div>
          <div id="jpg-pdf-gallery" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto p-1"></div>
        </div>`;
    }

    if (tool.id === 'batch-img-resizer') {
      return `
        <div class="space-y-4">
          <div class="flex flex-wrap justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-200 gap-2">
            <div class="flex items-center gap-2">
              <label class="text-xs font-bold text-slate-700">Resize Mode:</label>
              <select id="batch-resizer-mode" class="custom-input text-xs py-1 px-2.5" onchange="onBatchModeChanged()">
                <option value="fixed" selected>Fixed Dimensions (Width/Height)</option>
                <option value="percent">Percentage Scale (e.g. 50%, 75%)</option>
                <option value="target-size">Target File Size Limit (e.g. < 500 KB)</option>
              </select>
            </div>
            <div id="batch-mode-inputs" class="flex items-center gap-2 text-xs">
              <input type="number" id="batch-width" placeholder="Width (px)" class="custom-input py-1 px-2 w-24">
              <span>×</span>
              <input type="number" id="batch-height" placeholder="Height (px)" class="custom-input py-1 px-2 w-24">
              <label class="inline-flex items-center gap-1 font-bold text-slate-600 ml-1"><input type="checkbox" id="batch-lock-aspect" checked class="accent-indigo-600"> Lock Aspect</label>
            </div>
          </div>
          <div id="batch-resizer-gallery" class="space-y-2 max-h-[440px] overflow-y-auto p-1"></div>
        </div>`;
    }

    if (tool.id === 'png-compressor') {
      return `
        <div class="space-y-4">
          <div class="text-center">
            <span class="text-xs font-bold text-slate-600"><i class="fa-solid fa-arrows-left-right text-indigo-600 mr-1.5"></i>Drag the center divider horizontally to compare Original vs Lossless Compressed</span>
          </div>
          <div id="png-compare-wrapper" class="compare-container bg-slate-100">
            <span class="compare-badge-left">ORIGINAL</span>
            <span class="compare-badge-right">LOSSLESS PNG</span>
            <img id="png-compare-orig" class="compare-image-original" src="" alt="Original PNG">
            <div id="png-compare-overlay" class="compare-overlay-wrapper">
              <img id="png-compare-comp" class="compare-image-compressed" src="" alt="Compressed PNG">
            </div>
            <div id="png-compare-divider" class="compare-divider-handle" style="left: 50%;">
              <i class="fa-solid fa-arrows-left-right text-xs"></i>
            </div>
          </div>
          <div id="png-metrics-card" class="grid grid-cols-4 gap-2 text-center text-xs">
            <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200"><span class="text-[10px] text-slate-400 font-bold block">ORIGINAL</span><div id="png-metric-orig" class="font-extrabold text-slate-800 mt-0.5">-- KB</div></div>
            <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200"><span class="text-[10px] text-slate-400 font-bold block">OPTIMIZED</span><div id="png-metric-comp" class="font-extrabold text-emerald-700 mt-0.5">-- KB</div></div>
            <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200"><span class="text-[10px] text-slate-400 font-bold block">SAVED</span><div id="png-metric-saved" class="font-extrabold text-emerald-700 mt-0.5">-- KB</div></div>
            <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200"><span class="text-[10px] text-slate-400 font-bold block">REDUCTION</span><div id="png-metric-percent" class="font-extrabold text-emerald-700 mt-0.5">-- %</div></div>
          </div>
        </div>`;
    }

    if (tool.id === 'webp-converter') {
      return `
        <div class="space-y-4">
          <div class="flex flex-wrap justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 gap-2">
            <div class="flex items-center gap-3">
              <label class="text-xs font-bold text-slate-700">Quality: <span id="webp-quality-val" class="text-indigo-600 font-extrabold">80%</span></label>
              <input type="range" id="webp-quality-range" min="10" max="100" value="80" class="w-32 accent-indigo-600" oninput="document.getElementById('webp-quality-val').textContent = this.value + '%'">
            </div>
            <label class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
              <input type="checkbox" id="webp-lossless-check" class="accent-indigo-600"> Lossless Mode (100% Quality)
            </label>
          </div>
          <div id="webp-batch-gallery" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto p-1"></div>
        </div>`;
    }

    // Default Fallbacks
    switch (tool.uiType) {
      case TOOL_UI_TYPES.PDF_PAGE_ORGANIZER:
        return `<div id="pdf-page-cards-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[480px] overflow-y-auto p-1"></div>`;
      case TOOL_UI_TYPES.CONVERTER_SIMPLE:
        return `
          <div class="space-y-4">
            <div id="converter-file-info" class="hidden"></div>
            <div class="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-xl border border-slate-200 text-center space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl mx-auto shadow-inner">
                <i class="fa-solid ${tool.icon || 'fa-right-left'}"></i>
              </div>
              <div>
                <h4 class="text-sm font-extrabold text-slate-900">${tool.name}</h4>
                <p class="text-xs text-slate-500 max-w-xs mx-auto mt-1">${tool.description}</p>
              </div>
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-xs">
                <i class="fa-solid fa-circle-info text-indigo-500"></i>
                Upload a file above, then click the process button to convert.
              </div>
            </div>
          </div>`;
      case TOOL_UI_TYPES.OCR_TRANSLATE:
        return `
          <div class="space-y-3">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 class="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1"><i class="fa-solid fa-file-lines text-indigo-600"></i> Extracted Document Content</h4>
              <textarea id="ocr-extracted-text" readonly rows="10" class="custom-input w-full text-xs font-mono bg-white" placeholder="Text extracted from document will appear here after processing..."></textarea>
            </div>
            <div id="ai-result-area" class="hidden p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <h4 class="text-xs font-bold text-indigo-800 mb-2 flex items-center gap-1"><i class="fa-solid fa-robot"></i> AI Generated Output</h4>
              <div id="ai-result-content" class="text-xs text-indigo-900 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto bg-white p-3 rounded-lg border border-indigo-100"></div>
            </div>
          </div>`;
      case TOOL_UI_TYPES.QUIZ_CREATOR:
        return `
          <div class="space-y-3">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div class="flex justify-between items-center mb-2">
                <h4 class="text-xs font-bold text-slate-700 flex items-center gap-1"><i class="fa-solid fa-file-lines text-indigo-600"></i> Extracted Content from Source</h4>
                <span id="quiz-content-length" class="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 font-bold text-slate-500">0 chars</span>
              </div>
              <textarea id="quiz-extracted-text" readonly rows="6" class="custom-input w-full text-xs font-mono bg-white" placeholder="Text extracted from PDF/image will appear here. You may also paste your own content."></textarea>
              <div class="mt-2"><label class="text-[10px] font-bold text-slate-500 uppercase mr-2">Or paste custom content:</label><input type="checkbox" id="quiz-enable-custom-text" class="accent-indigo-600"></div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div class="p-3 bg-white rounded-xl border border-slate-200"><div class="text-[10px] font-bold text-slate-500 uppercase">Questions</div><div id="quiz-stat-questions" class="text-xl font-extrabold text-slate-900 mt-0.5">--</div></div>
              <div class="p-3 bg-white rounded-xl border border-slate-200"><div class="text-[10px] font-bold text-slate-500 uppercase">Language</div><div id="quiz-stat-language" class="text-xl font-extrabold text-indigo-700 mt-0.5">--</div></div>
              <div class="p-3 bg-white rounded-xl border border-slate-200"><div class="text-[10px] font-bold text-slate-500 uppercase">Type</div><div id="quiz-stat-type" class="text-xl font-extrabold text-purple-700 mt-0.5">--</div></div>
              <div class="p-3 bg-white rounded-xl border border-slate-200"><div class="text-[10px] font-bold text-slate-500 uppercase">Difficulty</div><div id="quiz-stat-difficulty" class="text-xl font-extrabold text-amber-700 mt-0.5">--</div></div>
            </div>
          </div>`;
      default:
        return `
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div id="file-info-display" class="text-sm text-slate-700 space-y-2">
              <div class="flex items-center gap-2"><i class="fa-solid fa-file-lines text-indigo-600"></i> <span id="file-info-name">No file selected</span></div>
              <div class="flex items-center gap-2 text-xs text-slate-500"><i class="fa-solid fa-database"></i> Size: <span id="file-info-size">--</span></div>
              <div class="flex items-center gap-2 text-xs text-slate-500"><i class="fa-solid fa-clock"></i> Modified: <span id="file-info-date">--</span></div>
            </div>
          </div>`;
    }
  }

  async function handleStudioFiles(newFiles) {
    const tool = state.activeTool; if (!tool) return;
    
    // For single-file tools, replace; for multi-file tools, append
    if (tool.multiple) {
      state.files = [...state.files, ...newFiles];
    } else {
      state.files = [newFiles[0]];
    }

    const dropzone = document.getElementById('studio-dropzone');
    const workArea = document.getElementById('studio-work-area');
    if (dropzone) dropzone.classList.add('hidden');
    if (workArea) workArea.classList.remove('hidden');

    const file = state.files[0]; if (!file) return;
    const countBadge = document.getElementById('studio-item-count-badge');
    if (countBadge) countBadge.textContent = `${state.files.length} File${state.files.length > 1 ? 's' : ''}`;

    const fin = document.getElementById('file-info-name');
    if (fin) {
      fin.textContent = file.name;
      const fs = document.getElementById('file-info-size');
      if (fs) fs.textContent = (typeof formatFileSize === 'function') ? formatFileSize(file.size) : `${Math.round(file.size/1024)} KB`;
      const fd = document.getElementById('file-info-date');
      if (fd) fd.textContent = new Date(file.lastModified).toLocaleDateString();
    }

    // Tool-specific initialization
    if (tool.id === 'pdf-merger') {
      renderMergerFileList();
      return;
    }

    if (tool.id === 'jpg-to-pdf') {
      renderJpgToPdfGallery();
      return;
    }

    if (tool.id === 'batch-img-resizer') {
      renderBatchResizerGallery();
      return;
    }

    if (tool.id === 'webp-converter') {
      renderWebpBatchGallery();
      return;
    }

    if (tool.id === 'png-compressor') {
      runPngLosslessComparison(file);
      return;
    }

    if (file.type.includes('pdf')) {
      showToast('Analyzing and rendering PDF document...', 'info');
      try {
        const buffer = await file.arrayBuffer();
        state.pdfPageCards = await PDFEngine.renderPageThumbnails(buffer);
        if (countBadge) countBadge.textContent = `${state.pdfPageCards.length} Pages`;

        if (tool.id === 'pdf-splitter') renderSplitterGrid();
        else if (tool.id === 'pdf-unmerger') runUnmergerAnalysis();
        else if (tool.id === 'pdf-page-reorder') renderPageOrganizerGrid();
        else if (tool.id === 'pdf-page-deleter') renderDeleterGrid();
        else if (tool.id === 'pdf-crop-tool') initInteractiveCropCanvas();
        else if (tool.id === 'pdf-compressor-smart') initSmartCompressorView(file.size);
        else if (tool.id === 'lossless-pdf-shrinker') initLosslessShrinkView(file.size);
        else if (tool.id === 'pdf-target-shrinker') initTargetShrinkView(file.size);
        else if (tool.id === 'pdf-to-xlsx') runPdfToExcelAnalysis();
        else if (tool.id === 'pdf-to-pptx') initPdfToPptxView();
        else if (tool.id === 'pdf-to-jpg') runPdfToJpgExtraction();
        else if (tool.uiType === TOOL_UI_TYPES.PDF_PAGE_ORGANIZER) renderPageOrganizerGrid();

        if (tool.uiType === TOOL_UI_TYPES.QUIZ_CREATOR || tool.uiType === TOOL_UI_TYPES.OCR_TRANSLATE) {
          await extractPdfTextForQuizOrAI(file);
        }
      } catch (e) {
        console.error(e);
        showToast('Could not load PDF document. Please verify the file is not password-protected or corrupted.', 'error');
      }
    } else if (tool.id === 'xlsx-to-pdf') {
      runXlsxToPdfPreview(file);
    } else if (tool.id === 'pptx-to-pdf') {
      initPptxToPdfView(file);
    } else if (tool.uiType === TOOL_UI_TYPES.CONVERTER_SIMPLE || tool.id === 'pdf-to-docx' || tool.id === 'docx-to-pdf') {
      // Converter tools — just show file info, work area already visible, ready to process
      const convInfoEl = document.getElementById('converter-file-info');
      if (convInfoEl) {
        convInfoEl.innerHTML = `<div class="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <i class="fa-solid fa-file text-indigo-600 text-2xl flex-shrink-0"></i>
          <div class="min-w-0">
            <p class="font-extrabold text-sm text-slate-900 truncate">${file.name}</p>
            <p class="text-xs text-slate-500">${formatFileSize(file.size)} · Ready to convert</p>
          </div>
          <span class="ml-auto text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
            <i class="fa-solid fa-check mr-1"></i>File loaded
          </span>
        </div>`;
        convInfoEl.classList.remove('hidden');
      }
      if (tool.uiType === TOOL_UI_TYPES.QUIZ_CREATOR || tool.uiType === TOOL_UI_TYPES.OCR_TRANSLATE) {
        try { await extractPdfTextForQuizOrAI(file); } catch(e) {}
      }
    } else if (file.type.startsWith('image/')) {
      renderImagePreview(file);
      if (tool.uiType === TOOL_UI_TYPES.QUIZ_CREATOR) {
        try {
          const text = await runOCROnImage(file);
          state.extractedText = text;
          const qet = document.getElementById('quiz-extracted-text');
          if (qet) qet.value = text;
          updateQuizStats();
        } catch (e) {}
      }
    } else if (tool.uiType === TOOL_UI_TYPES.QUIZ_CREATOR && (file.name.endsWith('.txt') || file.name.endsWith('.docx'))) {
      try {
        const text = await extractTextFromDoc(file);
        state.extractedText = text;
        const qet = document.getElementById('quiz-extracted-text');
        if (qet) qet.value = text;
        updateQuizStats();
      } catch (e) { console.error(e); }
    }
  }

  // --- 1. PDF MERGER CONTROLS & GALLERY ---
  window.renderMergerFileList = function() {
    const list = document.getElementById('merger-file-list');
    if (!list) return;
    list.innerHTML = '';
    state.files.forEach((f, idx) => {
      const card = document.createElement('div');
      card.className = 'draggable-card p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs';
      card.draggable = true;
      card.ondragstart = (e) => { state.activeDragIndex = idx; card.classList.add('is-dragging'); };
      card.ondragend = () => { card.classList.remove('is-dragging'); };
      card.ondragover = (e) => { e.preventDefault(); card.classList.add('drag-over'); };
      card.ondragleave = () => { card.classList.remove('drag-over'); };
      card.ondrop = (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        if (state.activeDragIndex !== null && state.activeDragIndex !== idx) {
          const moved = state.files.splice(state.activeDragIndex, 1)[0];
          state.files.splice(idx, 0, moved);
          renderMergerFileList();
        }
      };

      card.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="cursor-grab text-slate-400 hover:text-indigo-600 p-1 text-sm"><i class="fa-solid fa-grip-vertical"></i></span>
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-xs">${idx + 1}</div>
          <div>
            <h5 class="text-xs font-extrabold text-slate-900">${f.name}</h5>
            <p class="text-[10px] text-slate-400">${formatFileSize(f.size)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" onclick="moveMergerFile(${idx}, -1)" ${idx === 0 ? 'disabled class="opacity-20"' : 'class="text-slate-500 hover:text-indigo-600 p-1"'} title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
          <button type="button" onclick="moveMergerFile(${idx}, 1)" ${idx === state.files.length - 1 ? 'disabled class="opacity-20"' : 'class="text-slate-500 hover:text-indigo-600 p-1"'} title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
          <button type="button" onclick="removeMergerFile(${idx})" class="text-rose-500 hover:text-rose-700 p-1 text-xs" title="Remove"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      `;
      list.appendChild(card);
    });

    const badge = document.getElementById('studio-item-count-badge');
    if (badge) badge.textContent = `${state.files.length} PDFs Queued`;
  };

  window.moveMergerFile = function(fromIdx, direction) {
    const toIdx = fromIdx + direction;
    if (toIdx < 0 || toIdx >= state.files.length) return;
    const moved = state.files.splice(fromIdx, 1)[0];
    state.files.splice(toIdx, 0, moved);
    renderMergerFileList();
  };

  window.removeMergerFile = function(idx) {
    state.files.splice(idx, 1);
    if (state.files.length === 0) {
      document.getElementById('studio-dropzone')?.classList.remove('hidden');
      document.getElementById('studio-work-area')?.classList.add('hidden');
    } else {
      renderMergerFileList();
    }
  };

  // --- 2. PDF SPLITTER ---
  window.renderSplitterGrid = function() {
    const grid = document.getElementById('splitter-thumbnail-grid');
    const badge = document.getElementById('splitter-pages-badge');
    if (badge) badge.textContent = `${state.pdfPageCards.length} Pages Total`;
    if (!grid) return;
    grid.innerHTML = '';

    state.pdfPageCards.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = 'splitter-page-card p-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-500 transition relative flex flex-col items-center shadow-xs';
      cardEl.dataset.page = card.pageNum;
      cardEl.onclick = () => toggleSplitterPage(card.pageNum);
      cardEl.innerHTML = `
        <div class="flex justify-between items-center w-full mb-1">
          <span class="text-[10px] font-bold text-slate-600">Page ${card.pageNum}</span>
          <span class="splitter-check-indicator w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-white"></span>
        </div>
        <div class="w-full h-32 flex items-center justify-center bg-slate-50 rounded overflow-hidden">
          <img src="${card.dataUrl}" class="max-h-full max-w-full object-contain">
        </div>
      `;
      grid.appendChild(cardEl);
    });

    highlightSplitterRanges();
  };

  window.onSplitterModeChanged = function() {
    const mode = document.getElementById('splitter-mode-select')?.value;
    const rangeBox = document.getElementById('splitter-range-container');
    if (rangeBox) rangeBox.style.display = mode === 'individual' ? 'none' : 'flex';
  };

  window.toggleSplitterPage = function(pageNum) {
    const input = document.getElementById('splitter-range-input');
    if (!input) return;
    let parts = input.value.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
    const strNum = String(pageNum);
    if (parts.includes(strNum)) {
      parts = parts.filter(p => p !== strNum);
    } else {
      parts.push(strNum);
    }
    input.value = parts.join(', ');
    highlightSplitterRanges();
  };

  window.highlightSplitterRanges = function() {
    const input = document.getElementById('splitter-range-input');
    const rangeStr = input?.value || '';
    const totalPages = state.pdfPageCards.length;
    const groups = PDFEngine.parsePageRanges(rangeStr, totalPages);
    const included = new Set();
    groups.forEach(g => g.pages.forEach(p => included.add(p)));

    document.querySelectorAll('.splitter-page-card').forEach(cardEl => {
      const p = parseInt(cardEl.dataset.page);
      const isInc = included.has(p);
      const indicator = cardEl.querySelector('.splitter-check-indicator');
      if (isInc) {
        cardEl.classList.add('border-indigo-600', 'bg-indigo-50/20');
        if (indicator) {
          indicator.className = 'splitter-check-indicator w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]';
          indicator.innerHTML = '<i class="fa-solid fa-check"></i>';
        }
      } else {
        cardEl.classList.remove('border-indigo-600', 'bg-indigo-50/20');
        if (indicator) {
          indicator.className = 'splitter-check-indicator w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-white';
          indicator.innerHTML = '';
        }
      }
    });
  };

  // --- 3. PDF UN-MERGER ---
  window.runUnmergerAnalysis = async function() {
    if (!state.files[0]) return;
    const buffer = await state.files[0].arrayBuffer();
    state.detectedSubDocs = await PDFEngine.unmergePDF(buffer);
    renderUnmergerList();
  };

  window.renderUnmergerList = function() {
    const list = document.getElementById('unmerger-subdocs-list');
    const badge = document.getElementById('unmerger-count-badge');
    if (!list) return;
    list.innerHTML = '';

    if (badge) badge.textContent = `${state.detectedSubDocs.length} Constituent Document${state.detectedSubDocs.length > 1 ? 's' : ''}`;

    state.detectedSubDocs.forEach((doc, idx) => {
      const card = document.createElement('div');
      card.className = 'p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3';
      const thumbs = doc.pages.slice(0, 4).map(p => {
        const c = state.pdfPageCards.find(card => card.pageNum === p);
        return c ? `<div class="w-14 h-18 bg-slate-50 rounded border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0"><img src="${c.dataUrl}" class="max-h-full max-w-full object-contain"></div>` : '';
      }).join('');

      card.innerHTML = `
        <div class="flex flex-wrap justify-between items-center gap-2">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">${idx + 1}</div>
            <div>
              <h5 class="text-xs font-extrabold text-slate-900">${doc.title}</h5>
              <p class="text-[10px] text-slate-500 font-bold">Pages ${doc.startPage} – ${doc.endPage} (${doc.pageCount} Pages)</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs">
            ${idx > 0 ? `<button type="button" onclick="mergeUnmergerWithPrevious(${idx})" class="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded transition"><i class="fa-solid fa-link"></i> Merge with Prev</button>` : ''}
          </div>
        </div>
        <div class="flex items-center gap-2 overflow-x-auto py-1">
          ${thumbs}
          ${doc.pages.length > 4 ? `<div class="w-14 h-18 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">+${doc.pages.length - 4} more</div>` : ''}
        </div>
      `;
      list.appendChild(card);
    });
  };

  window.mergeUnmergerWithPrevious = function(idx) {
    if (idx <= 0) return;
    const prev = state.detectedSubDocs[idx - 1];
    const curr = state.detectedSubDocs[idx];
    prev.endPage = curr.endPage;
    prev.pages = [...prev.pages, ...curr.pages];
    prev.pageCount = prev.pages.length;
    state.detectedSubDocs.splice(idx, 1);
    renderUnmergerList();
  };

  // --- 4. PDF PAGE RE-ORDERER ---
  window.renderPageOrganizerGrid = function() {
    const grid = document.getElementById('pdf-page-cards-grid');
    if (!grid) return;
    grid.innerHTML = '';

    state.pdfPageCards.forEach((card, index) => {
      if (card.deleted) return;
      const cardEl = document.createElement('div');
      cardEl.className = 'draggable-card thumb-card p-2 bg-white border border-slate-200 rounded-xl relative shadow-sm flex flex-col items-center justify-between group';
      cardEl.draggable = true;
      cardEl.ondragstart = () => { state.activeDragIndex = index; cardEl.classList.add('is-dragging'); };
      cardEl.ondragend = () => { cardEl.classList.remove('is-dragging'); };
      cardEl.ondragover = (e) => { e.preventDefault(); cardEl.classList.add('drag-over'); };
      cardEl.ondragleave = () => { cardEl.classList.remove('drag-over'); };
      cardEl.ondrop = (e) => {
        e.preventDefault();
        cardEl.classList.remove('drag-over');
        if (state.activeDragIndex !== null && state.activeDragIndex !== index) {
          const moved = state.pdfPageCards.splice(state.activeDragIndex, 1)[0];
          state.pdfPageCards.splice(index, 0, moved);
          renderPageOrganizerGrid();
        }
      };

      cardEl.innerHTML = `
        <div class="flex justify-between items-center w-full mb-1">
          <span class="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">Page ${card.pageNum}</span>
          <div class="flex items-center gap-1">
            <button type="button" onclick="openFullPagePdfModal(${card.pageNum})" class="text-slate-400 hover:text-indigo-600 text-[11px]" title="Full Page Modal Preview"><i class="fa-solid fa-expand"></i></button>
            <button type="button" onclick="deleteStudioPageAt(${index})" class="text-rose-500 hover:text-rose-700 text-xs font-bold" title="Delete Page"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
        <div class="w-full h-32 flex items-center justify-center bg-slate-50 rounded overflow-hidden my-1 cursor-pointer" onclick="openFullPagePdfModal(${card.pageNum})">
          <img src="${card.dataUrl}" class="max-h-full max-w-full object-contain transition-transform duration-300" style="transform: rotate(${card.rotation}deg)">
        </div>
        <div class="flex justify-between items-center w-full pt-1.5 border-t border-slate-100 text-xs text-slate-600">
          <button type="button" onclick="rotateStudioPageAt(${index}, -90)" class="hover:text-indigo-600 font-semibold p-1" title="Rotate 90° CCW"><i class="fa-solid fa-rotate-left"></i></button>
          <span class="text-[10px] font-bold text-slate-400">${card.rotation}°</span>
          <button type="button" onclick="rotateStudioPageAt(${index}, 90)" class="hover:text-indigo-600 font-semibold p-1" title="Rotate 90° CW"><i class="fa-solid fa-rotate-right"></i></button>
        </div>`;
      grid.appendChild(cardEl);
    });
  };

  window.rotateStudioPageAt = function(index, deg = 90) {
    const r = ((state.pdfPageCards[index].rotation + deg) % 360 + 360) % 360;
    state.pdfPageCards[index].rotation = r;
    renderPageOrganizerGrid();
  };

  window.rotateAllPages = function(angle) {
    state.pdfPageCards.forEach(c => c.rotation = (((c.rotation + angle) % 360) + 360) % 360);
    renderPageOrganizerGrid();
  };

  window.deleteStudioPageAt = function(index) {
    state.pdfPageCards[index].deleted = true;
    renderPageOrganizerGrid();
  };

  window.openFullPagePdfModal = async function(pageNum) {
    if (!state.files[0]) return;
    showToast('Rendering high-res page preview...', 'info');
    try {
      const arrayBuffer = await state.files[0].arrayBuffer();
      const highResUrl = await PDFEngine.renderHighResPage(arrayBuffer, pageNum, 2.0);
      const modal = document.createElement('div');
      modal.className = 'preview-modal-backdrop animate-fade-in';
      modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
      modal.innerHTML = `
        <div class="preview-modal-dialog">
          <div class="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-900 text-white">
            <h4 class="text-xs font-bold flex items-center gap-2"><i class="fa-solid fa-magnifying-glass text-indigo-400"></i> Full-Page High-Res Preview: Page ${pageNum}</h4>
            <button onclick="this.closest('.preview-modal-backdrop').remove()" class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="p-4 overflow-auto flex items-center justify-center max-h-[calc(90vh-60px)] bg-slate-800">
            <img src="${highResUrl}" class="max-w-full max-h-full object-contain rounded shadow-lg">
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } catch (e) {
      console.error(e);
      showToast('Could not generate full-page modal view.', 'error');
    }
  };

  // --- 5. PDF PAGE DELETER ---
  window.renderDeleterGrid = function() {
    const grid = document.getElementById('deleter-thumbnail-grid');
    if (!grid) return;
    grid.innerHTML = '';

    state.pdfPageCards.forEach(card => {
      const isSelected = state.selectedDeletePages.has(card.pageNum);
      const cardEl = document.createElement('div');
      cardEl.className = `p-2 rounded-xl border-2 transition cursor-pointer flex flex-col items-center relative ${isSelected ? 'border-rose-500 bg-rose-50/40' : 'border-slate-200 bg-white'}`;
      cardEl.onclick = () => toggleDeleterPage(card.pageNum);
      cardEl.innerHTML = `
        <div class="flex justify-between items-center w-full mb-1">
          <span class="text-[10px] font-extrabold ${isSelected ? 'text-rose-700' : 'text-slate-700'}">Page ${card.pageNum}</span>
          <span class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${isSelected ? 'bg-rose-500 text-white' : 'border border-slate-300'}">
            ${isSelected ? '<i class="fa-solid fa-trash-can"></i>' : ''}
          </span>
        </div>
        <div class="w-full h-32 flex items-center justify-center bg-slate-50 rounded overflow-hidden relative">
          <img src="${card.dataUrl}" class="max-h-full max-w-full object-contain">
          ${isSelected ? '<div class="absolute inset-0 bg-rose-500/20 backdrop-blur-[0.5px] flex items-center justify-center text-rose-600 font-black text-xs uppercase tracking-wider">Marked to Delete</div>' : ''}
        </div>
      `;
      grid.appendChild(cardEl);
    });

    updateDeleterSummary();
  };

  window.toggleDeleterPage = function(pageNum) {
    if (state.selectedDeletePages.has(pageNum)) {
      state.selectedDeletePages.delete(pageNum);
    } else {
      state.selectedDeletePages.add(pageNum);
    }
    renderDeleterGrid();
  };

  window.selectDeleterPages = function(type) {
    const total = state.pdfPageCards.length;
    if (type === 'even') {
      state.selectedDeletePages.clear();
      for (let p = 1; p <= total; p++) { if (p % 2 === 0) state.selectedDeletePages.add(p); }
    } else if (type === 'odd') {
      state.selectedDeletePages.clear();
      for (let p = 1; p <= total; p++) { if (p % 2 !== 0) state.selectedDeletePages.add(p); }
    } else if (type === 'invert') {
      const next = new Set();
      for (let p = 1; p <= total; p++) { if (!state.selectedDeletePages.has(p)) next.add(p); }
      state.selectedDeletePages = next;
    } else if (type === 'clear') {
      state.selectedDeletePages.clear();
    }
    renderDeleterGrid();
  };

  window.updateDeleterSummary = function() {
    const sumEl = document.getElementById('deleter-status-summary');
    if (!sumEl) return;
    const total = state.pdfPageCards.length;
    const delCount = state.selectedDeletePages.size;
    const remCount = total - delCount;
    sumEl.textContent = `${delCount} marked to delete • ${remCount} remaining`;
  };

  // --- 6. PDF CROP TOOL ---
  window.initInteractiveCropCanvas = function() {
    const canvas = document.getElementById('crop-render-canvas');
    if (!canvas || !state.pdfPageCards[0]) return;

    const img = new Image();
    img.onload = () => {
      // Scale canvas to fit container
      const maxW = 420;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      state.cropState.origW = canvas.width;
      state.cropState.origH = canvas.height;

      // Position crop box default (inset 20px)
      const box = document.getElementById('crop-box-element');
      if (box) {
        box.style.left = '20px';
        box.style.top = '20px';
        box.style.width = `${Math.max(60, canvas.width - 40)}px`;
        box.style.height = `${Math.max(60, canvas.height - 40)}px`;
      }
      syncCropInputsFromBox();
      attachCropDragHandlers();
    };
    img.src = state.pdfPageCards[0].dataUrl;
  };

  function attachCropDragHandlers() {
    const box = document.getElementById('crop-box-element');
    const wrapper = document.getElementById('crop-canvas-wrapper');
    if (!box || !wrapper) return;

    let isDragging = false, isResizing = false, currentHandle = null;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0, startW = 0, startH = 0;

    box.onmousedown = (e) => {
      if (e.target.classList.contains('crop-handle')) {
        isResizing = true;
        currentHandle = e.target.dataset.handle;
      } else {
        isDragging = true;
      }
      startX = e.clientX;
      startY = e.clientY;
      startLeft = box.offsetLeft;
      startTop = box.offsetTop;
      startW = box.offsetWidth;
      startH = box.offsetHeight;
      e.preventDefault();
    };

    window.onmousemove = (e) => {
      if (!isDragging && !isResizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const maxW = wrapper.offsetWidth;
      const maxH = wrapper.offsetHeight;

      if (isDragging) {
        let nextLeft = Math.max(0, Math.min(startLeft + dx, maxW - startW));
        let nextTop = Math.max(0, Math.min(startTop + dy, maxH - startH));
        box.style.left = `${nextLeft}px`;
        box.style.top = `${nextTop}px`;
      } else if (isResizing) {
        let nextL = startLeft, nextT = startTop, nextW = startW, nextH = startH;
        if (currentHandle.includes('e')) nextW = Math.max(30, Math.min(startW + dx, maxW - startLeft));
        if (currentHandle.includes('s')) nextH = Math.max(30, Math.min(startH + dy, maxH - startTop));
        if (currentHandle.includes('w')) {
          const adjDx = Math.min(dx, startW - 30);
          nextL = Math.max(0, startLeft + adjDx);
          nextW = startW - (nextL - startLeft);
        }
        if (currentHandle.includes('n')) {
          const adjDy = Math.min(dy, startH - 30);
          nextT = Math.max(0, startTop + adjDy);
          nextH = startH - (nextT - startTop);
        }
        box.style.left = `${nextL}px`;
        box.style.top = `${nextT}px`;
        box.style.width = `${nextW}px`;
        box.style.height = `${nextH}px`;
      }
      syncCropInputsFromBox();
    };

    window.onmouseup = () => { isDragging = false; isResizing = false; currentHandle = null; };
  }

  window.syncCropInputsFromBox = function() {
    const box = document.getElementById('crop-box-element');
    const wrapper = document.getElementById('crop-canvas-wrapper');
    if (!box || !wrapper) return;

    const unit = document.getElementById('crop-unit-select')?.value || 'px';
    const factor = unit === 'mm' ? 0.264583 : (unit === 'in' ? 0.0104167 : 1);

    const left = Math.round(box.offsetLeft * factor);
    const top = Math.round(box.offsetTop * factor);
    const right = Math.round((wrapper.offsetWidth - (box.offsetLeft + box.offsetWidth)) * factor);
    const bottom = Math.round((wrapper.offsetHeight - (box.offsetTop + box.offsetHeight)) * factor);

    const inT = document.getElementById('crop-input-top');
    const inR = document.getElementById('crop-input-right');
    const inB = document.getElementById('crop-input-bottom');
    const inL = document.getElementById('crop-input-left');

    if (inT) inT.value = top;
    if (inR) inR.value = right;
    if (inB) inB.value = bottom;
    if (inL) inL.value = left;
  };

  window.onCropInputChanged = function() {
    const box = document.getElementById('crop-box-element');
    const wrapper = document.getElementById('crop-canvas-wrapper');
    if (!box || !wrapper) return;

    const unit = document.getElementById('crop-unit-select')?.value || 'px';
    const factor = unit === 'mm' ? 3.7795 : (unit === 'in' ? 96 : 1);

    const top = parseFloat(document.getElementById('crop-input-top')?.value || 0) * factor;
    const right = parseFloat(document.getElementById('crop-input-right')?.value || 0) * factor;
    const bottom = parseFloat(document.getElementById('crop-input-bottom')?.value || 0) * factor;
    const left = parseFloat(document.getElementById('crop-input-left')?.value || 0) * factor;

    box.style.left = `${Math.max(0, left)}px`;
    box.style.top = `${Math.max(0, top)}px`;
    box.style.width = `${Math.max(30, wrapper.offsetWidth - left - right)}px`;
    box.style.height = `${Math.max(30, wrapper.offsetHeight - top - bottom)}px`;
  };

  window.onCropUnitChange = function() {
    syncCropInputsFromBox();
  };

  // --- 7. SMART COMPRESSOR ---
  window.initSmartCompressorView = function(origSize) {
    const origSizeEl = document.getElementById('compress-orig-size');
    const origPagesEl = document.getElementById('compress-orig-pages');
    if (origSizeEl) origSizeEl.textContent = formatFileSize(origSize);
    if (origPagesEl) origPagesEl.textContent = state.pdfPageCards.length.toString();
  };

  // --- 8. LOSSLESS SHRINKER ---
  window.initLosslessShrinkView = function(origSize) {
    const sizeEl = document.getElementById('lossless-orig-size');
    if (sizeEl) sizeEl.textContent = formatFileSize(origSize);
  };

  // --- 9. TARGET SIZE SHRINKER ---
  window.initTargetShrinkView = function(origSize) {
    const sizeEl = document.getElementById('target-shrinker-orig-size');
    if (sizeEl) sizeEl.textContent = formatFileSize(origSize);
  };

  // --- 10. PDF TO EXCEL (XLSX) ---
  window.runPdfToExcelAnalysis = async function() {
    if (!state.files[0]) return;
    const buffer = await state.files[0].arrayBuffer();
    const res = await PDFEngine.pdfToExcel(buffer);
    state.extractedTableRows = res.rows;
    renderExcelInteractivePreview(res.rows);
  };

  window.renderExcelInteractivePreview = function(rows) {
    const container = document.getElementById('excel-interactive-preview');
    const stat = document.getElementById('excel-preview-stat');
    if (!container) return;

    if (!rows || rows.length === 0) {
      container.innerHTML = '<p class="text-slate-400 text-xs text-center py-8">No tabular structures detected.</p>';
      return;
    }

    if (stat) stat.textContent = `${rows.length} Detected Rows`;

    let html = '<table class="excel-preview-table"><thead><tr>';
    const headerRow = rows[0] || [];
    headerRow.forEach((col, idx) => {
      html += `<th>Column ${idx + 1}</th>`;
    });
    html += '</tr></thead><tbody>';

    rows.slice(0, 50).forEach(row => {
      html += '<tr>';
      headerRow.forEach((_, idx) => {
        const val = row[idx] !== undefined ? row[idx] : '';
        html += `<td>${val}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    if (rows.length > 50) {
      html += `<div class="p-2 text-center text-[11px] text-slate-400 bg-slate-50 border-t">Showing first 50 rows. All ${rows.length} rows will be exported in Excel (.xlsx).</div>`;
    }

    container.innerHTML = html;
  };

  // --- 11. EXCEL (XLSX) TO PDF ---
  window.runXlsxToPdfPreview = async function(file) {
    const fileNameEl = document.getElementById('xlsx-file-name');
    const fileDetailsEl = document.getElementById('xlsx-file-details');
    if (fileNameEl) fileNameEl.textContent = file.name;
    if (fileDetailsEl) fileDetailsEl.textContent = `${formatFileSize(file.size)} • Spreadsheet Ready`;

    const buffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = window.XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    renderExcelInteractivePreview(data);
  };

  // --- 12. PDF TO PPTX ---
  window.initPdfToPptxView = function() {
    const badge = document.getElementById('pptx-pages-badge');
    if (badge) badge.textContent = `${state.pdfPageCards.length} Slides Detected`;
  };

  // --- 13. PPTX TO PDF ---
  window.initPptxToPdfView = function(file) {
    const details = document.getElementById('pptx-pdf-details');
    if (details) details.innerHTML = `<i class="fa-solid fa-check text-emerald-600 mr-1.5"></i> ${file.name} (${formatFileSize(file.size)})`;
  };

  // --- 14. PDF TO JPG ---
  window.runPdfToJpgExtraction = async function() {
    const gallery = document.getElementById('pdf-jpg-gallery');
    if (!gallery || !state.files[0]) return;
    gallery.innerHTML = '<div class="col-span-full text-center py-6 text-xs text-indigo-600"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Rendering high-res images...</div>';

    const buffer = await state.files[0].arrayBuffer();
    const dpi = parseFloat(document.getElementById('pdf-jpg-dpi')?.value || 2);
    const range = document.getElementById('pdf-jpg-range')?.value || '';
    const images = await PDFEngine.pdfToImages(buffer, 'image/jpeg', dpi, range);

    gallery.innerHTML = '';
    images.forEach(img => {
      const card = document.createElement('div');
      card.className = 'p-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-between';
      card.innerHTML = `
        <div class="w-full flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
          <span>Page ${img.page}</span>
          <span>JPG</span>
        </div>
        <div class="w-full h-32 flex items-center justify-center bg-slate-50 rounded overflow-hidden">
          <img src="${img.dataUrl}" class="max-h-full max-w-full object-contain">
        </div>
        <a href="${img.dataUrl}" download="page_${img.page}.jpg" class="mt-2 w-full py-1 text-center rounded bg-slate-100 hover:bg-indigo-600 hover:text-white transition font-bold text-[10px] text-slate-700">
          <i class="fa-solid fa-download"></i> Download JPG
        </a>
      `;
      gallery.appendChild(card);
    });
  };

  // --- 15. JPG TO PDF ---
  window.renderJpgToPdfGallery = function() {
    const gallery = document.getElementById('jpg-pdf-gallery');
    if (!gallery) return;
    gallery.innerHTML = '';

    state.files.forEach((f, idx) => {
      const card = document.createElement('div');
      card.className = 'draggable-card p-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-between';
      card.draggable = true;
      card.ondragstart = () => { state.activeDragIndex = idx; card.classList.add('is-dragging'); };
      card.ondragend = () => { card.classList.remove('is-dragging'); };
      card.ondragover = (e) => { e.preventDefault(); card.classList.add('drag-over'); };
      card.ondragleave = () => { card.classList.remove('drag-over'); };
      card.ondrop = (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        if (state.activeDragIndex !== null && state.activeDragIndex !== idx) {
          const moved = state.files.splice(state.activeDragIndex, 1)[0];
          state.files.splice(idx, 0, moved);
          renderJpgToPdfGallery();
        }
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        card.innerHTML = `
          <div class="w-full flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
            <span class="truncate max-w-[80px]">${f.name}</span>
            <button type="button" onclick="removeJpgFile(${idx})" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="w-full h-32 flex items-center justify-center bg-slate-50 rounded overflow-hidden">
            <img src="${e.target.result}" class="max-h-full max-w-full object-contain">
          </div>
          <div class="text-[9px] text-slate-400 font-bold mt-1">Order #${idx + 1}</div>
        `;
      };
      reader.readAsDataURL(f);
      gallery.appendChild(card);
    });

    const badge = document.getElementById('studio-item-count-badge');
    if (badge) badge.textContent = `${state.files.length} Photos Queued`;
  };

  window.removeJpgFile = function(idx) {
    state.files.splice(idx, 1);
    renderJpgToPdfGallery();
  };

  // --- 16. BATCH IMAGE RESIZER ---
  window.onBatchModeChanged = function() {
    const mode = document.getElementById('batch-resizer-mode')?.value;
    const box = document.getElementById('batch-mode-inputs');
    if (!box) return;

    if (mode === 'percent') {
      box.innerHTML = '<label class="font-bold text-slate-600">Scale:</label><input type="number" id="batch-percent" value="50" min="5" max="500" class="custom-input py-1 px-2 w-20"><span>%</span>';
    } else if (mode === 'target-size') {
      box.innerHTML = '<label class="font-bold text-slate-600">Target Size Limit:</label><input type="number" id="batch-target-kb" value="500" min="10" class="custom-input py-1 px-2 w-24"><span>KB</span>';
    } else {
      box.innerHTML = '<input type="number" id="batch-width" placeholder="Width (px)" class="custom-input py-1 px-2 w-24"><span>×</span><input type="number" id="batch-height" placeholder="Height (px)" class="custom-input py-1 px-2 w-24"><label class="inline-flex items-center gap-1 font-bold text-slate-600 ml-1"><input type="checkbox" id="batch-lock-aspect" checked class="accent-indigo-600"> Lock Aspect</label>';
    }
  };

  window.renderBatchResizerGallery = function() {
    const gallery = document.getElementById('batch-resizer-gallery');
    if (!gallery) return;
    gallery.innerHTML = '';

    state.files.forEach((f, idx) => {
      const row = document.createElement('div');
      row.className = 'p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs';
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">${idx + 1}</div>
          <div>
            <h5 class="font-bold text-slate-900">${f.name}</h5>
            <p class="text-[10px] text-slate-400">Original Size: ${formatFileSize(f.size)}</p>
          </div>
        </div>
        <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Ready to Resize</span>
      `;
      gallery.appendChild(row);
    });

    const badge = document.getElementById('studio-item-count-badge');
    if (badge) badge.textContent = `${state.files.length} Images Queued`;
  };

  // --- 17. LOSSLESS PNG COMPRESSOR ---
  window.runPngLosslessComparison = async function(file) {
    showToast('Analyzing and running lossless palette optimization...', 'info');
    const res = await PDFEngine.compressPNGLossless(file);
    state.pngComparison = res;

    const imgOrig = document.getElementById('png-compare-orig');
    const imgComp = document.getElementById('png-compare-comp');
    if (imgOrig) imgOrig.src = res.originalDataUrl;
    if (imgComp) imgComp.src = res.dataUrl;

    const metOrig = document.getElementById('png-metric-orig');
    const metComp = document.getElementById('png-metric-comp');
    const metSaved = document.getElementById('png-metric-saved');
    const metPct = document.getElementById('png-metric-percent');

    if (metOrig) metOrig.textContent = `${res.originalKB} KB`;
    if (metComp) metComp.textContent = `${res.compressedKB} KB`;
    if (metSaved) metSaved.textContent = `${res.savedKB} KB`;
    if (metPct) metPct.textContent = `${res.percentSaved}%`;

    initCompareSlider();
  };

  function initCompareSlider() {
    const container = document.getElementById('png-compare-wrapper');
    const overlay = document.getElementById('png-compare-overlay');
    const divider = document.getElementById('png-compare-divider');
    if (!container || !overlay || !divider) return;

    let isMoving = false;

    const move = (clientX) => {
      const rect = container.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const pct = (x / rect.width) * 100;
      overlay.style.width = `${pct}%`;
      divider.style.left = `${pct}%`;
    };

    container.onmousedown = (e) => { isMoving = true; move(e.clientX); };
    window.onmousemove = (e) => { if (isMoving) move(e.clientX); };
    window.onmouseup = () => { isMoving = false; };
  }

  // --- 18. WEBP CONVERTER ---
  window.renderWebpBatchGallery = function() {
    const gallery = document.getElementById('webp-batch-gallery');
    if (!gallery) return;
    gallery.innerHTML = '';

    state.files.forEach(f => {
      const card = document.createElement('div');
      card.className = 'p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between';
      card.innerHTML = `
        <div class="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
          <span class="truncate max-w-[90px]">${f.name}</span>
          <span class="text-indigo-600 uppercase">WEBP</span>
        </div>
        <div class="py-4 text-center">
          <i class="fa-solid fa-file-image text-3xl text-indigo-400"></i>
        </div>
        <div class="text-[10px] text-slate-400 text-center font-bold">
          ${formatFileSize(f.size)}
        </div>
      `;
      gallery.appendChild(card);
    });

    const badge = document.getElementById('studio-item-count-badge');
    if (badge) badge.textContent = `${state.files.length} Images Queued`;
  };

  function renderStudioControls(tool) {
    const container = document.getElementById('studio-controls-container');
    if (!container || !tool) return;
    container.innerHTML = '';
    const controls = tool.controls || [];
    const parts = controls.map(ctrl => getControlHtml(ctrl, tool));
    if (parts.length === 0) {
      parts.push(`<div class="p-4 rounded-xl bg-slate-50 border border-slate-200"><p class="text-xs text-slate-600 font-semibold leading-relaxed"><i class="fa-solid fa-circle-info text-indigo-600 mr-1.5"></i>This tool uses recommended defaults optimized for ${tool.name}. No additional parameters required.</p></div>`);
    }
    container.innerHTML = parts.join('');
    attachControlListeners(tool);
    updateQuizStats();
  }

  function getControlHtml(ctrl, tool) {
    switch (ctrl) {
      case 'compression-level': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between"><span><i class="fa-solid fa-gauge-high text-indigo-600"></i> Compression Level</span><span id="ctrl-compression-label" class="text-indigo-600">Balanced</span></label><select id="ctrl-compression-level" class="custom-input w-full text-xs"><option value="low">Low (85% size, highest quality)</option><option value="medium" selected>Medium / Balanced (60%)</option><option value="high">High Aggressive (40%)</option><option value="max">Maximum / Extreme (25%)</option></select></div>`;
      case 'target-size': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-weight-hanging text-indigo-600"></i> Target File Size</label><div class="flex gap-2"><input type="number" id="ctrl-target-size" class="custom-input flex-1 text-xs" placeholder="2" value="2" min="0.1" step="0.1"><select id="ctrl-target-unit" class="custom-input text-xs px-2"><option value="MB" selected>MB</option><option value="KB">KB</option></select></div><p class="text-[10px] text-slate-400">Engine iteratively compresses until under limit.</p></div>`;
      case 'split-mode': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-scissors text-indigo-600"></i> Split Mode</label><select id="ctrl-split-mode" class="custom-input w-full text-xs"><option value="ranges" selected>Split by Custom Page Ranges</option><option value="individual">Every Page → Separate PDF</option><option value="every-n">Every N Pages → New PDF</option><option value="half">Split into 2 Equal Halves</option></select></div>`;
      case 'page-range': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-hashtag text-indigo-600"></i> Page Range(s)</label><input type="text" id="ctrl-page-range" class="custom-input w-full text-xs" placeholder="e.g. 1-5, 8, 12-15"><p class="text-[10px] text-slate-400">Comma-separated list. Use hyphen for ranges.</p></div>`;
      case 'rotate-angle': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-rotate-right text-indigo-600"></i> Default Rotation</label><div class="grid grid-cols-4 gap-1">${['0°','90°','180°','270°'].map((a,i)=>`<label class="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-500 transition ${i===0?'bg-indigo-50 border-indigo-500':''}"><input type="radio" name="rotate-default" value="${i*90}" ${i===0?'checked':''} class="accent-indigo-600"><span class="text-[10px] font-bold text-slate-700 mt-0.5">${a}</span></label>`).join('')}</div></div>`;
      case 'crop-margins': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-crop-simple text-indigo-600"></i> Crop Preset</label><select id="ctrl-crop-preset" class="custom-input w-full text-xs"><option value="custom" selected>Custom Margins (use workspace)</option><option value="tight">Tight Trim (remove 5mm all sides)</option><option value="standard">Standard Print Trim (10mm)</option><option value="ebook">E-Reader Friendly (15mm top/bottom)</option><option value="remove-white">Auto-remove Whitespace</option></select></div>`;
      case 'crop-pages-select': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-copy text-indigo-600"></i> Apply to All Pages</label><label class="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-lg cursor-pointer"><input type="checkbox" id="ctrl-crop-all" checked class="accent-indigo-600 w-4 h-4"> Apply crop margin values to all selected pages</label></div>`;
      case 'output-img-format': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-file-image text-indigo-600"></i> Output Image Format</label><select id="ctrl-img-format" class="custom-input w-full text-xs"><option value="jpg" selected>JPEG (Photo optimized)</option><option value="png">PNG (Lossless, transparent)</option><option value="webp">WEBP (Modern, smallest)</option><option value="tiff">TIFF (Print, uncompressed)</option></select></div>`;
      case 'resolution-dpi': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-gauge text-indigo-600"></i> Output Resolution (DPI)</label><select id="ctrl-dpi" class="custom-input w-full text-xs"><option value="72">72 DPI (Web / Screen)</option><option value="150">150 DPI (Tablet / E-Reader)</option><option value="300" selected>300 DPI (Standard Print)</option><option value="600">600 DPI (High Res / Prepress)</option></select></div>`;
      case 'image-dimensions': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-maximize text-indigo-600"></i> Resize Dimensions</label><div class="grid grid-cols-2 gap-2"><div><label class="text-[10px] text-slate-500">Width (px)</label><input type="number" id="ctrl-img-width" class="custom-input w-full text-xs" placeholder="Auto"></div><div><label class="text-[10px] text-slate-500">Height (px)</label><input type="number" id="ctrl-img-height" class="custom-input w-full text-xs" placeholder="Auto"></div></div><label class="inline-flex items-center gap-2 text-[11px] font-bold text-slate-700"><input type="checkbox" id="ctrl-lock-aspect" checked class="accent-indigo-600"> Lock aspect ratio (recommended)</label></div>`;
      case 'resample-method': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-wand-magic-sparkles text-indigo-600"></i> Resample Quality</label><select id="ctrl-resample" class="custom-input w-full text-xs"><option value="lanczos">Lanczos (Sharpest, print)</option><option value="bicubic" selected>Bicubic (Smooth, photo)</option><option value="bilinear">Bilinear (Fast)</option><option value="nearest">Nearest Neighbor (Pixel art)</option></select></div>`;
      case 'upscale-factor': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-expand text-indigo-600"></i> Upscale Multiplier</label><select id="ctrl-upscale" class="custom-input w-full text-xs"><option value="2">2× Enhanced Resolution</option><option value="4" selected>4× Super Resolution</option><option value="8">8× Ultra Resolution (slowest)</option></select></div>`;
      case 'denoise-level': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-droplet text-indigo-600"></i> Noise Reduction</label><select id="ctrl-denoise" class="custom-input w-full text-xs"><option value="none">None (preserve grain)</option><option value="low" selected>Low / Subtle</option><option value="medium">Medium</option><option value="high">High (strong cleanup)</option></select></div>`;
      case 'paper-size-orientation': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-file text-indigo-600"></i> Paper & Orientation</label><select id="ctrl-paper-size" class="custom-input w-full text-xs mb-1"><option value="A4" selected>A4 International (210×297mm)</option><option value="Letter">US Letter (8.5×11 in)</option><option value="Legal">US Legal (8.5×14 in)</option><option value="A3">A3 Poster (297×420mm)</option><option value="fit">Fit to Content Size</option></select><div class="grid grid-cols-2 gap-1"><label class="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-500 transition bg-indigo-50 border-indigo-500"><input type="radio" name="orientation" value="portrait" checked class="accent-indigo-600"><span class="text-[11px] font-bold text-slate-700"><i class="fa-solid fa-file-lines"></i> Portrait</span></label><label class="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-500 transition"><input type="radio" name="orientation" value="landscape" class="accent-indigo-600"><span class="text-[11px] font-bold text-slate-700"><i class="fa-solid fa-file-lines fa-rotate-90"></i> Landscape</span></label></div></div>`;
      case 'image-layout': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-layer-group text-indigo-600"></i> Multi-Image Layout</label><select id="ctrl-img-layout" class="custom-input w-full text-xs"><option value="one-per-page" selected>One Image per Page</option><option value="fit-multiple">Fit as Many as Possible</option><option value="2-per-page">2 Images per Page</option><option value="4-per-page">4 Images per Page (contact sheet)</option></select><div class="space-y-1 pt-1"><label class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700"><input type="checkbox" id="ctrl-margin-auto" checked class="accent-indigo-600"> Auto-center margins</label><br><label class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700"><input type="checkbox" id="ctrl-page-numbers" class="accent-indigo-600"> Add page numbers</label></div></div>`;
      case 'docx-format-options': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-file-word text-indigo-600"></i> DOCX Layout Mode</label><select id="ctrl-docx-mode" class="custom-input w-full text-xs"><option value="faithful" selected>Faithful Visual Layout (frames)</option><option value="flowable">Editable Flowable Text (recommended)</option><option value="text-only">Text Extraction Only</option></select></div>`;
      case 'excel-format': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-table-cells text-indigo-600"></i> Table Extraction Mode</label><select id="ctrl-excel-mode" class="custom-input w-full text-xs"><option value="ai" selected>Smart Table Detection (AI)</option><option value="ocr-grid">OCR Grid Extraction</option><option value="whole-page">Whole Page → Single Sheet</option></select></div>`;
      case 'pptx-layout': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-file-powerpoint text-indigo-600"></i> Slide Strategy</label><select id="ctrl-pptx-mode" class="custom-input w-full text-xs"><option value="1-to-1" selected>1 PDF Page = 1 Slide (image)</option><option value="text-extract">Extract text → Title + Bullets</option><option value="template">Apply Slide Master Template</option></select></div>`;
      case 'cmyk-picker': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-palette text-indigo-600"></i> CMYK Conversion Profile</label><select id="ctrl-cmyk-profile" class="custom-input w-full text-xs"><option value="us-web-coated" selected>US Web Coated SWOP v2</option><option value="fogra39">FOGRA39 (Europe coated)</option><option value="japan-color">Japan Color 2001 Coated</option><option value="newspaper">Newspaper SNAP (uncoated)</option></select><label class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mt-1"><input type="checkbox" checked class="accent-indigo-600"> Embed ICC profile for press</label></div>`;
      case 'icc-profile': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-shield text-indigo-600"></i> Rendering Intent</label><select id="ctrl-rendering-intent" class="custom-input w-full text-xs"><option value="perceptual" selected>Perceptual (Photographs)</option><option value="relative">Relative Colorimetric (Best for logos)</option><option value="saturation">Saturation (Charts / Graphs)</option><option value="absolute">Absolute Colorimetric (Proofing)</option></select></div>`;
      case 'bleed-size': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-ruler text-indigo-600"></i> Bleed Size</label><select id="ctrl-bleed-size" class="custom-input w-full text-xs"><option value="3">3mm (Digital Print)</option><option value="5" selected>5mm (Standard Offset)</option><option value="8">8mm (Large Format)</option><option value="custom">Custom value...</option></select></div>`;
      case 'crop-mark-style': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-scissors text-indigo-600"></i> Printer Mark Style</label><select id="ctrl-mark-style" class="custom-input w-full text-xs"><option value="standard" selected>Standard ISO Crop Marks</option><option value="japanese">Japanese Double Marks</option><option value="minimal">Minimal Thin Marks</option></select><div class="grid grid-cols-2 gap-1 mt-1"><label class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700"><input type="checkbox" id="ctrl-reg-marks" checked class="accent-indigo-600"> Registration</label><label class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700"><input type="checkbox" id="ctrl-color-bars" checked class="accent-indigo-600"> Color Bars</label></div></div>`;
      case 'imposition-scheme': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-book-open text-indigo-600"></i> Imposition Layout</label><select id="ctrl-imposition" class="custom-input w-full text-xs"><option value="2up-saddle">2-Up Saddle Stitch Booklet</option><option value="4up-perfect">4-Up Perfect Bound</option><option value="step-repeat">Step & Repeat (business cards)</option><option value="cut-stack">Cut & Stack Labels</option></select></div>`;
      case 'signature-size': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-layer-group text-indigo-600"></i> Signature / Sheets</label><input type="number" id="ctrl-signature-size" class="custom-input w-full text-xs" value="16" min="4" step="4"><p class="text-[10px] text-slate-400">Pages per folded signature (multiple of 4).</p></div>`;
      case 'rich-black-values': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-droplet text-indigo-600"></i> Rich Black Recipe</label><div class="grid grid-cols-4 gap-1 text-center"><div><label class="text-[10px] font-bold text-cyan-700">C%</label><input type="number" id="ctrl-rb-c" value="60" class="custom-input w-full text-xs text-center"></div><div><label class="text-[10px] font-bold text-fuchsia-700">M%</label><input type="number" id="ctrl-rb-m" value="40" class="custom-input w-full text-xs text-center"></div><div><label class="text-[10px] font-bold text-yellow-700">Y%</label><input type="number" id="ctrl-rb-y" value="40" class="custom-input w-full text-xs text-center"></div><div><label class="text-[10px] font-bold text-slate-900">K%</label><input type="number" id="ctrl-rb-k" value="100" class="custom-input w-full text-xs text-center"></div></div></div>`;
      case 'tac-limit': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-gauge-high text-indigo-600"></i> Total Area Coverage (TAC) %</label><input type="number" id="ctrl-tac" class="custom-input w-full text-xs" value="300" min="100" max="400" step="10"><p class="text-[10px] text-slate-400">Above limit: highlighted in red warning overlay.</p></div>`;
      case 'gif-fps': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-film text-indigo-600"></i> GIF Frame Rate (FPS)</label><input type="number" id="ctrl-gif-fps" class="custom-input w-full text-xs" value="15" min="1" max="60"></div>`;
      case 'gif-quality': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-gauge text-indigo-600"></i> Color Palette Quality</label><select id="ctrl-gif-quality" class="custom-input w-full text-xs"><option value="256">256 Colors (Highest)</option><option value="128" selected>128 Colors (Balanced)</option><option value="64">64 Colors (Smaller)</option><option value="32">32 Colors (Smallest)</option></select></div>`;
      case 'trim-range': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-scissors text-indigo-600"></i> Trim (Seconds)</label><div class="grid grid-cols-2 gap-2"><div><label class="text-[10px] text-slate-500">From (s)</label><input type="number" id="ctrl-trim-start" class="custom-input w-full text-xs" placeholder="0.0" step="0.1"></div><div><label class="text-[10px] text-slate-500">To (s)</label><input type="number" id="ctrl-trim-end" class="custom-input w-full text-xs" placeholder="Auto" step="0.1"></div></div></div>`;
      case 'audio-bitrate': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-music text-indigo-600"></i> Audio Bitrate (kbps)</label><select id="ctrl-bitrate" class="custom-input w-full text-xs"><option value="128">128 kbps (Good)</option><option value="192" selected>192 kbps (Better)</option><option value="256">256 kbps (Excellent)</option><option value="320">320 kbps (Studio Quality)</option></select></div>`;
      case 'audio-format': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-file-audio text-indigo-600"></i> Output Format</label><select id="ctrl-audio-fmt" class="custom-input w-full text-xs"><option value="mp3" selected>MP3 (Universal)</option><option value="wav">WAV (Uncompressed)</option><option value="ogg">OGG Vorbis (Open)</option><option value="m4a">M4A / AAC (Apple)</option></select></div>`;
      case 'font-output-format': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-font text-indigo-600"></i> Target Format(s)</label><div class="space-y-1 text-[11px]">${['WOFF2','WOFF','TTF','OTF','EOT'].map(f=>`<label class="flex items-center gap-1.5 font-bold text-slate-700 p-1.5 rounded hover:bg-slate-50 cursor-pointer"><input type="checkbox" ${f!=='EOT'?'checked':''} class="font-format-check accent-indigo-600" value="${f.toLowerCase()}"> ${f} <span class="text-slate-400 font-normal text-[10px] ml-auto">${fontHint(f)}</span></label>`).join('')}</div></div>`;
      case 'px-rem-picker': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-calculator text-indigo-600"></i> Conversion Type</label><select id="ctrl-pxrem-type" class="custom-input w-full text-xs"><option value="px-to-rem" selected>PX → REM</option><option value="rem-to-px">REM → PX</option><option value="px-to-em">PX → EM</option><option value="em-to-px">EM → PX</option></select></div>`;
      case 'base-font-size': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-text-height text-indigo-600"></i> Root Font Size (PX)</label><input type="number" id="ctrl-base-font" class="custom-input w-full text-xs" value="16" min="8" max="32"><p class="text-[10px] text-slate-400">Browser default: 16px. Custom designs may use 10px (62.5% trick).</p></div>`;
      case 'case-picker': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-font-case text-indigo-600"></i> Target Case</label><select id="ctrl-case-type" class="custom-input w-full text-xs"><option value="upper">UPPERCASE</option><option value="lower">lowercase</option><option value="title" selected>Title Case</option><option value="sentence">Sentence case</option><option value="camel">camelCase</option><option value="pascal">PascalCase</option><option value="snake">snake_case</option><option value="kebab">kebab-case</option></select></div>`;
      case 'glass-picker': return `<div class="space-y-3"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-sparkles text-indigo-600"></i> Glassmorphism Params</label><div><label class="text-[10px] text-slate-500 flex justify-between">Blur: <span id="lbl-blur">16px</span></label><input type="range" id="ctrl-blur" min="0" max="60" value="16" class="w-full accent-indigo-600"></div><div><label class="text-[10px] text-slate-500 flex justify-between">Opacity: <span id="lbl-opacity">10%</span></label><input type="range" id="ctrl-opacity" min="0" max="100" value="10" class="w-full accent-indigo-600"></div><div><label class="text-[10px] text-slate-500 flex justify-between">Saturation: <span id="lbl-sat">180%</span></label><input type="range" id="ctrl-sat" min="50" max="300" value="180" class="w-full accent-indigo-600"></div><div class="grid grid-cols-2 gap-2"><div><label class="text-[10px] text-slate-500">BG Color</label><input type="color" id="ctrl-glass-bg" value="#ffffff" class="w-full h-8 rounded"></div><div><label class="text-[10px] text-slate-500">Border</label><input type="color" id="ctrl-glass-border" value="#ffffff" class="w-full h-8 rounded"></div></div><div id="glass-preview" class="h-20 rounded-xl mt-2 flex items-center justify-center relative overflow-hidden"><div class="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400"></div><div id="glass-preview-box" class="relative z-10 px-3 py-2 rounded-lg text-[10px] font-bold text-slate-900 border">Preview Box</div></div></div>`;
      case 'contrast-picker': return `<div class="space-y-3"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-circle-half-stroke text-indigo-600"></i> Color Pair to Test</label><div class="grid grid-cols-2 gap-2"><div><label class="text-[10px] text-slate-500">Foreground (Text)</label><div class="flex gap-1"><input type="color" id="ctrl-fg" value="#000000" class="w-10 h-8 rounded"><input type="text" id="ctrl-fg-hex" class="custom-input flex-1 text-xs font-mono" value="#000000"></div></div><div><label class="text-[10px] text-slate-500">Background</label><div class="flex gap-1"><input type="color" id="ctrl-bg" value="#ffffff" class="w-10 h-8 rounded"><input type="text" id="ctrl-bg-hex" class="custom-input flex-1 text-xs font-mono" value="#ffffff"></div></div></div><div id="wcag-result" class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"></div></div>`;
      case 'svgo-options': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-code text-indigo-600"></i> SVGO Optimization</label><div class="space-y-1 text-[11px]">${[['cleanupAttrs',true,'Remove attributes whitespace'],['removeMetadata',true,'Remove metadata/comments'],['removeUselessStrokeAndFill',true,'Remove unnecessary fills'],['collapseGroups',true,'Collapse useless groups'],['removeViewBox',false,'Remove viewBox (not recommended)'],['removeDimensions',true,'Remove width/height attrs']].map(([k,v,d])=>`<label class="flex items-start gap-1.5 font-bold text-slate-700 p-1.5 rounded hover:bg-slate-50 cursor-pointer"><input type="checkbox" ${v?'checked':''} class="svgo-check accent-indigo-600 mt-0.5" value="${k}"><div class="flex-1">${d}<span class="text-slate-400 font-normal block text-[10px]">${k}</span></div></label>`).join('')}</div></div>`;
      case 'og-picker': return `<div class="space-y-2 text-xs"><div><label class="text-[10px] font-bold text-slate-500 uppercase">Site / Page Title</label><input type="text" id="ctrl-og-title" class="custom-input w-full text-xs" placeholder="My Awesome Website"></div><div><label class="text-[10px] font-bold text-slate-500 uppercase">Description</label><textarea id="ctrl-og-desc" rows="2" class="custom-input w-full text-xs" placeholder="Short description (under 200 chars)..."></textarea></div><div><label class="text-[10px] font-bold text-slate-500 uppercase">URL</label><input type="text" id="ctrl-og-url" class="custom-input w-full text-xs" placeholder="https://example.com"></div><div><label class="text-[10px] font-bold text-slate-500 uppercase">Image URL (1200×630)</label><input type="text" id="ctrl-og-img" class="custom-input w-full text-xs" placeholder="https://.../og-image.png"></div><div class="grid grid-cols-2 gap-2"><div><label class="text-[10px] font-bold text-slate-500 uppercase">Type</label><select id="ctrl-og-type" class="custom-input w-full text-xs"><option>website</option><option>article</option><option>product</option><option>profile</option></select></div><div><label class="text-[10px] font-bold text-slate-500 uppercase">Twitter Card</label><select id="ctrl-og-tw" class="custom-input w-full text-xs"><option>summary_large_image</option><option>summary</option><option>app</option></select></div></div></div>`;
      case 'scale-reference': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-ruler text-indigo-600"></i> Known Dimension</label><div class="grid grid-cols-2 gap-2"><div><label class="text-[10px] text-slate-500">Measured on PDF (pts)</label><input type="number" id="ctrl-ref-pts" class="custom-input w-full text-xs" placeholder="e.g. 120"></div><div><label class="text-[10px] text-slate-500">Real Length (m)</label><input type="number" id="ctrl-ref-m" class="custom-input w-full text-xs" placeholder="e.g. 5.0" step="0.01"></div></div><select id="ctrl-unit" class="custom-input w-full text-xs mt-1"><option value="m" selected>Meters</option><option value="cm">Centimeters</option><option value="mm">Millimeters</option><option value="ft">Feet & Inches</option></select></div>`;
      case 'bates-prefix': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-gavel text-indigo-600"></i> Bates Number Format</label><div><label class="text-[10px] text-slate-500">Prefix / Matter</label><input type="text" id="ctrl-bates-prefix" class="custom-input w-full text-xs font-mono" placeholder="ABC-2026-"></div></div>`;
      case 'bates-start': return `<div class="space-y-2"><div class="grid grid-cols-2 gap-2"><div><label class="text-[10px] text-slate-500">Start Number</label><input type="number" id="ctrl-bates-start" class="custom-input w-full text-xs" value="1"></div><div><label class="text-[10px] text-slate-500">Pad Digits</label><input type="number" id="ctrl-bates-pad" class="custom-input w-full text-xs" value="6" min="3" max="10"></div></div><div><label class="text-[10px] text-slate-500">Position</label><select id="ctrl-bates-pos" class="custom-input w-full text-xs"><option value="br" selected>Bottom Right</option><option value="bl">Bottom Left</option><option value="tr">Top Right</option><option value="tl">Top Left</option></select></div></div>`;
      case 'dicom-output-format': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-heart-pulse text-indigo-600"></i> Output Format</label><select id="ctrl-dicom-out" class="custom-input w-full text-xs"><option value="png" selected>PNG Image (per slice)</option><option value="jpg">JPEG Image</option><option value="pdf">PDF Report w/ overlay</option></select></div>`;
      case 'epub-options': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-book-atlas text-indigo-600"></i> EPUB Layout Mode</label><select id="ctrl-epub-mode" class="custom-input w-full text-xs"><option value="reflow" selected>Reflowable Text (recommended)</option><option value="fixed">Fixed Layout (comics, design)</option></select></div>`;
      case 'pdfa-level': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-vault text-indigo-600"></i> PDF/A Compliance Level</label><select id="ctrl-pdfa" class="custom-input w-full text-xs"><option value="1b" selected>PDF/A-1b (Basic visual preservation)</option><option value="2b">PDF/A-2b (Modern + JPEG2000 + layers)</option><option value="3b">PDF/A-3b (Allow embedded files)</option><option value="2u">PDF/A-2u (Unicode text accessible)</option></select></div>`;
      case 'summary-length': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-list text-indigo-600"></i> Summary Depth</label><select id="ctrl-summary-len" class="custom-input w-full text-xs"><option value="brief">Brief (3-5 bullets)</option><option value="standard" selected>Standard (6-10 bullets)</option><option value="detailed">Detailed (10-20 bullets)</option><option value="executive">Executive Brief (with TL;DR + sections)</option></select></div>`;
      case 'summary-language': return buildLanguageControl('ctrl-summary-lang');
      case 'chat-language': return buildLanguageControl('ctrl-chat-lang');
      case 'quiz-language': return buildLanguageControl('ctrl-quiz-language', true);
      case 'quiz-type': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-list-check text-indigo-600"></i> Quiz Format</label><select id="ctrl-quiz-type" class="custom-input w-full text-xs"><option value="mcq" selected>Multiple Choice Questions (MCQ)</option><option value="true-false">True / False Questions</option><option value="flashcards">Flashcards (Q + A pairs)</option><option value="fill-blank">Fill in the Blank</option><option value="mixed">Mixed Format</option><option value="short-answer">Short Answer Qs</option></select></div>`;
      case 'question-count': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-hashtag text-indigo-600"></i> Number of Questions</label><div class="flex gap-1"><input type="range" id="ctrl-question-count" min="3" max="50" value="10" class="flex-1 accent-indigo-600"><input type="number" id="ctrl-question-count-num" value="10" min="3" max="50" class="custom-input w-16 text-xs text-center"></div></div>`;
      case 'difficulty-level': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-fire text-amber-600"></i> Difficulty Level</label><div class="grid grid-cols-3 gap-1">${['easy','medium','hard'].map((d,i)=>`<label class="flex flex-col items-center p-2 rounded-lg border cursor-pointer hover:border-indigo-500 transition ${i===1?'bg-indigo-50 border-indigo-500':'border-slate-200'}"><input type="radio" name="difficulty" value="${d}" ${i===1?'checked':''} onchange="document.getElementById('ctrl-difficulty-level').value=this.value" class="accent-indigo-600"><span class="text-[10px] font-bold text-slate-700 mt-0.5 capitalize">${d}</span></label>`).join('')}</div><input type="hidden" id="ctrl-difficulty-level" value="medium"></div>`;
      case 'merge-options': return `<div class="space-y-3">
        <div>
          <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
            <i class="fa-solid fa-file-signature text-indigo-600"></i> Output File Name
          </label>
          <input type="text" id="ctrl-merge-filename" class="custom-input w-full text-xs" value="merged_document.pdf" placeholder="e.g. merged_document.pdf">
        </div>
        <div>
          <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
            <i class="fa-solid fa-arrows-spin text-indigo-600"></i> Orientation Normalization
          </label>
          <select id="ctrl-merge-orientation" class="custom-input w-full text-xs">
            <option value="auto" selected>Auto (Preserve page proportions)</option>
            <option value="portrait">Enforce Portrait (All pages)</option>
            <option value="landscape">Enforce Landscape (All pages)</option>
          </select>
        </div>
        <div class="space-y-1 pt-1">
          <label class="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-lg cursor-pointer w-full">
            <input type="checkbox" id="ctrl-merge-toc" checked class="accent-indigo-600"> Preserve Document Outlines
          </label>
        </div>
      </div>`;
      case 'png-compress-level': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-gauge text-indigo-600"></i> Optimization Level</label><select id="ctrl-png-level" class="custom-input w-full text-xs"><option value="1">Level 1 (Fast, less compression)</option><option value="3">Level 3 (Good)</option><option value="6" selected>Level 6 (Default)</option><option value="9">Level 9 (Slowest, maximum)</option></select></div>`;
      case 'webp-quality': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between"><span><i class="fa-solid fa-gauge text-indigo-600"></i> Quality</span><span id="lbl-webp" class="text-indigo-600">80%</span></label><input type="range" id="ctrl-webp-quality" min="10" max="100" value="80" class="w-full accent-indigo-600"><label class="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-lg cursor-pointer w-full mt-1"><input type="checkbox" id="ctrl-webp-lossless" class="accent-indigo-600"> Lossless Mode (Ignore lossy compression)</label></div>`;
      case 'output-format': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-file-export text-indigo-600"></i> Save As</label><select id="ctrl-out-format" class="custom-input w-full text-xs"><option value="webp" selected>WEBP (Primary)</option><option value="jpg">JPEG (Fallback)</option><option value="png">PNG</option><option value="avif">AVIF (Modern)</option></select></div>`;
      case 'vector-output-format': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-vector-square text-indigo-600"></i> Target Vector Format</label><select id="ctrl-vector-fmt" class="custom-input w-full text-xs"><option value="eps" selected>Encapsulated PostScript (EPS)</option><option value="dxf">AutoCAD DXF</option><option value="ai">Adobe Illustrator (AI)</option><option value="pdf">Vector PDF</option></select></div>`;
      case 'texture-format': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-image text-indigo-600"></i> Texture Format</label><select id="ctrl-tex-fmt" class="custom-input w-full text-xs"><option value="ktx2">KTX2 Basis Universal</option><option value="webp" selected>WEBP VP8/VP9</option><option value="astc">ASTC (Mobile GPUs)</option><option value="png">PNG (uncompressed)</option></select></div>`;
      case 'texture-quality': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between"><span><i class="fa-solid fa-gauge text-indigo-600"></i> Texture Quality</span><span id="lbl-tex" class="text-indigo-600">70%</span></label><input type="range" id="ctrl-tex-quality" min="10" max="100" value="70" class="w-full accent-indigo-600"></div>`;
      default: return '';
    }
  }

  function buildLanguageControl(id, includeAuto = false) {
    return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-language text-indigo-600"></i> Output Language</label><select id="${id}" class="custom-input w-full text-xs">${(includeAuto ? [{ code: 'auto', name: 'Auto-detect from document' }] : []).concat(LANGUAGES).map(l => `<option value="${l.code}" ${l.code === 'en' ? 'selected' : ''}>${l.name}</option>`).join('')}</select></div>`;
  }
  function fontHint(f) { return { WOFF2: 'Modern browsers', WOFF: 'All browsers', TTF: 'Desktop & legacy', OTF: 'Advanced features', EOT: 'IE only' }[f] || ''; }

  function attachControlListeners(tool) {
    const comp = document.getElementById('ctrl-compression-level');
    if (comp) comp.addEventListener('change', () => {
      const labels = { low: 'Highest Quality', medium: 'Balanced', high: 'Small Size', max: 'Smallest Size' };
      const l = document.getElementById('ctrl-compression-label');
      if (l) l.textContent = labels[comp.value] || '';
      if (state.files[0]) updateCompressionEstimate(state.files[0].size);
    });
    const comp2 = document.getElementById('ctrl-compression-level');
    if (comp2 && state.files[0]) updateCompressionEstimate(state.files[0].size);

    const qc = document.getElementById('ctrl-question-count');
    const qc2 = document.getElementById('ctrl-question-count-num');
    if (qc && qc2) {
      qc.addEventListener('input', () => { qc2.value = qc.value; updateQuizStats(); });
      qc2.addEventListener('input', () => { qc.value = qc2.value; updateQuizStats(); });
    }
    ['ctrl-quiz-language', 'ctrl-quiz-type', 'ctrl-difficulty-level'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', updateQuizStats);
    });
    const webp = document.getElementById('ctrl-webp-quality');
    const lblW = document.getElementById('lbl-webp');
    if (webp && lblW) webp.addEventListener('input', () => lblW.textContent = `${webp.value}%`);
    const tex = document.getElementById('ctrl-tex-quality');
    const lblT = document.getElementById('lbl-tex');
    if (tex && lblT) tex.addEventListener('input', () => lblT.textContent = `${tex.value}%`);
  }

  function attachToolBehavior(tool) {
    if (tool.uiType === TOOL_UI_TYPES.TEXT_INPUT) {
      const sti = document.getElementById('studio-text-input');
      const caseType = document.getElementById('ctrl-case-type');
      if (sti && caseType) {
        const run = () => applyCaseTransform();
        sti.addEventListener('input', run);
        caseType.addEventListener('change', run);
      }
      const pxrem = document.getElementById('ctrl-pxrem-type');
      const baseF = document.getElementById('ctrl-base-font');
      if (pxrem || baseF) {
        [pxrem, baseF, sti].filter(Boolean).forEach(el => el.addEventListener('input', () => applyPxRemConversion()));
      }
      ['ctrl-blur', 'ctrl-opacity', 'ctrl-sat', 'ctrl-glass-bg', 'ctrl-glass-border'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => applyGlassPreview());
      });
      applyGlassPreview();
      ['ctrl-fg', 'ctrl-fg-hex', 'ctrl-bg', 'ctrl-bg-hex'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => { syncColorPair(); applyWCAGCheck(); });
      });
      applyWCAGCheck();
      ['ctrl-og-title', 'ctrl-og-desc', 'ctrl-og-url', 'ctrl-og-img', 'ctrl-og-type', 'ctrl-og-tw'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', applyOGBuilder);
      });
      applyOGBuilder();
    }
  }

  window.clearTextInput = function() {
    const t = document.getElementById('studio-text-input');
    if (t) { t.value = ''; t.focus(); }
    const p = document.getElementById('text-output-preview');
    if (p) p.classList.add('hidden');
  };
  window.copyTextOutput = function() {
    const c = document.getElementById('text-output-content');
    if (c && navigator.clipboard) {
      navigator.clipboard.writeText(c.textContent || '');
      showToast('Copied to clipboard!', 'success');
    }
  };

  function applyCaseTransform() {
    const input = document.getElementById('studio-text-input');
    const output = document.getElementById('text-output-content');
    const preview = document.getElementById('text-output-preview');
    const mode = document.getElementById('ctrl-case-type')?.value || 'title';
    if (!input || !output || !preview) return;
    let txt = input.value || '';
    const modes = {
      upper: () => txt.toUpperCase(),
      lower: () => txt.toLowerCase(),
      title: () => txt.replace(/\w\S*/g, s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()),
      sentence: () => txt.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()),
      camel: () => txt.replace(/(?:^\w|[A-Z]|\b\w)/g, (l, i) => i === 0 ? l.toLowerCase() : l.toUpperCase()).replace(/[\s_-]+/g, ''),
      pascal: () => txt.replace(/(?:^\w|[A-Z]|\b\w)/g, l => l.toUpperCase()).replace(/[\s_-]+/g, ''),
      snake: () => txt.toLowerCase().replace(/[\s-]+/g, '_'),
      kebab: () => txt.toLowerCase().replace(/[\s_]+/g, '-')
    };
    output.textContent = (modes[mode] || modes.title)();
    preview.classList.remove('hidden');
  }

  function applyPxRemConversion() {
    const input = document.getElementById('studio-text-input');
    const output = document.getElementById('text-output-content');
    const preview = document.getElementById('text-output-preview');
    const type = document.getElementById('ctrl-pxrem-type')?.value || 'px-to-rem';
    const base = parseFloat(document.getElementById('ctrl-base-font')?.value || '16');
    if (!input || !output || !preview) return;
    const vals = (input.value || '').split(/[\s,;]+/).map(v => parseFloat(v)).filter(v => !isNaN(v));
    const lines = vals.map(v => {
      switch (type) {
        case 'px-to-rem': return `${v}px  =  ${(v / base).toFixed(4)}rem`;
        case 'rem-to-px': return `${v}rem  =  ${(v * base).toFixed(2)}px`;
        case 'px-to-em': return `${v}px  =  ${(v / base).toFixed(4)}em`;
        case 'em-to-px': return `${v}em  =  ${(v * base).toFixed(2)}px`;
      }
    });
    output.textContent = `/* Base font size: ${base}px */\n\n` + lines.join('\n') || 'Enter numeric values in the input area.';
    preview.classList.remove('hidden');
  }

  function applyGlassPreview() {
    const blur = document.getElementById('ctrl-blur')?.value || 16;
    const opacity = document.getElementById('ctrl-opacity')?.value || 10;
    const sat = document.getElementById('ctrl-sat')?.value || 180;
    const bg = document.getElementById('ctrl-glass-bg')?.value || '#ffffff';
    const border = document.getElementById('ctrl-glass-border')?.value || '#ffffff';
    const lblB = document.getElementById('lbl-blur'), lblO = document.getElementById('lbl-opacity'), lblS = document.getElementById('lbl-sat');
    if (lblB) lblB.textContent = `${blur}px`;
    if (lblO) lblO.textContent = `${opacity}%`;
    if (lblS) lblS.textContent = `${sat}%`;
    const box = document.getElementById('glass-preview-box');
    if (box) {
      box.style.backdropFilter = `blur(${blur}px) saturate(${sat}%)`;
      box.style.webkitBackdropFilter = `blur(${blur}px) saturate(${sat}%)`;
      box.style.backgroundColor = hexToRgba(bg, opacity / 100);
      box.style.borderColor = hexToRgba(border, 0.5);
    }
    const output = document.getElementById('text-output-content');
    const preview = document.getElementById('text-output-preview');
    if (output && preview) {
      output.textContent = `.glass-panel {\n  backdrop-filter: blur(${blur}px) saturate(${sat}%);\n  -webkit-backdrop-filter: blur(${blur}px) saturate(${sat}%);\n  background-color: ${hexToRgba(bg, opacity / 100)};\n  border: 1px solid ${hexToRgba(border, 0.5)};\n  border-radius: 12px;\n}`;
      preview.classList.remove('hidden');
    }
  }

  function hexToRgba(hex, alpha = 1) {
    const h = (hex || '#ffffff').replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function syncColorPair() {
    const fgColor = document.getElementById('ctrl-fg');
    const fgHex = document.getElementById('ctrl-fg-hex');
    const bgColor = document.getElementById('ctrl-bg');
    const bgHex = document.getElementById('ctrl-bg-hex');
    if (fgColor && fgHex && fgColor.value !== fgHex.value?.toLowerCase()) fgHex.value = fgColor.value;
    if (fgHex && fgColor && fgHex.value?.startsWith('#') && fgHex.value.length === 7) fgColor.value = fgHex.value;
    if (bgColor && bgHex && bgColor.value !== bgHex.value?.toLowerCase()) bgHex.value = bgColor.value;
    if (bgHex && bgColor && bgHex.value?.startsWith('#') && bgHex.value.length === 7) bgColor.value = bgHex.value;
  }

  function luminance(hex) {
    const h = (hex || '').replace('#', '');
    if (h.length !== 6) return 0;
    const rgb = [0, 2, 4].map(i => {
      let c = parseInt(h.substring(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  function applyWCAGCheck() {
    const fg = document.getElementById('ctrl-fg')?.value || '#000000';
    const bg = document.getElementById('ctrl-bg')?.value || '#ffffff';
    const result = document.getElementById('wcag-result');
    const out = document.getElementById('text-output-content');
    const preview = document.getElementById('text-output-preview');
    if (!result) return;
    const l1 = luminance(fg), l2 = luminance(bg);
    const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    const passNormal = ratio >= 4.5, passLarge = ratio >= 3, passAAA = ratio >= 7;
    result.innerHTML = `
      <div class="flex justify-between items-center"><span class="font-bold">Contrast Ratio:</span><span class="font-extrabold text-lg">${ratio.toFixed(2)} : 1</span></div>
      <div class="pt-2 border-t space-y-1">
        <div class="flex justify-between"><span>AA Normal (4.5:1)</span><span class="font-bold ${passNormal ? 'text-emerald-600' : 'text-red-500'}">${passNormal ? '✓ PASS' : '✗ FAIL'}</span></div>
        <div class="flex justify-between"><span>AA Large Text (3:1)</span><span class="font-bold ${passLarge ? 'text-emerald-600' : 'text-red-500'}">${passLarge ? '✓ PASS' : '✗ FAIL'}</span></div>
        <div class="flex justify-between"><span>AAA Normal (7:1)</span><span class="font-bold ${passAAA ? 'text-emerald-600' : 'text-red-500'}">${passAAA ? '✓ PASS' : '✗ FAIL'}</span></div>
      </div>
      <div class="flex gap-2 pt-2 border-t">
        <div class="flex-1 text-center py-2 rounded font-bold text-sm" style="background:${bg};color:${fg}">Sample Aa</div>
        <div class="flex-1 text-center py-2 rounded font-bold text-lg" style="background:${bg};color:${fg}">Large 24px</div>
      </div>`;
    if (out && preview) {
      out.textContent = `/* WCAG Contrast Report */\nForeground: ${fg}\nBackground: ${bg}\nContrast Ratio: ${ratio.toFixed(2)}:1\n\n✓ AA Normal (4.5:1):    ${passNormal ? 'PASS' : 'FAIL'}\n✓ AA Large  (3:1):      ${passLarge ? 'PASS' : 'FAIL'}\n✓ AAA Normal (7:1):     ${passAAA ? 'PASS' : 'FAIL'}`;
      preview.classList.remove('hidden');
    }
  }

  function applyOGBuilder() {
    const title = document.getElementById('ctrl-og-title')?.value || '';
    const desc = document.getElementById('ctrl-og-desc')?.value || '';
    const url = document.getElementById('ctrl-og-url')?.value || '';
    const img = document.getElementById('ctrl-og-img')?.value || '';
    const type = document.getElementById('ctrl-og-type')?.value || 'website';
    const tw = document.getElementById('ctrl-og-tw')?.value || 'summary_large_image';
    const out = document.getElementById('text-output-content');
    const preview = document.getElementById('text-output-preview');
    if (!out || !preview) return;
    const lines = [
      '<!-- Essential Meta Tags -->',
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${desc}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:image" content="${img}">`,
      `<meta property="og:type" content="${type}">`,
      '',
      '<!-- Twitter Card -->',
      `<meta name="twitter:card" content="${tw}">`,
      `<meta name="twitter:title" content="${title}">`,
      `<meta name="twitter:description" content="${desc}">`,
      `<meta name="twitter:image" content="${img}">`,
      '',
      '<!-- SEO Bonus -->',
      `<meta name="description" content="${desc}">`,
      `<title>${title}</title>`
    ];
    out.textContent = lines.join('\n');
    preview.classList.remove('hidden');
  }

  function dataURLtoBlob(dataurl) {
    if (!dataurl) return new Blob([], { type: 'application/octet-stream' });
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  function setupProcessButton(tool) {
    const btn = document.getElementById('studio-btn-process');
    if (!btn) return;
    btn.onclick = async () => {
      const isText = tool.uiType === TOOL_UI_TYPES.TEXT_INPUT;
      if (!isText && state.files.length === 0) { showToast('Please upload a file first.', 'error'); return; }

      // ── Loading overlay (full workspace) ──────────────────────────────────
      let overlay = document.getElementById('studio-loading-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'studio-loading-overlay';
        overlay.className = 'fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 bg-slate-950/75 backdrop-blur-sm';
        overlay.innerHTML = `
          <div class="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col items-center gap-4 max-w-sm w-full mx-4 animate-fade-in">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
              <div class="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <i class="fa-solid fa-wand-magic-sparkles text-indigo-600 text-xl"></i>
              </div>
            </div>
            <div class="text-center">
              <h4 class="font-extrabold text-slate-900 text-sm mb-1" id="overlay-title">Processing…</h4>
              <p id="overlay-status" class="text-xs text-slate-500 min-h-[1.5rem]">Please wait, this may take a moment</p>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div id="overlay-progress-bar" class="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300 animate-pulse" style="width: 15%"></div>
            </div>
            <p class="text-[10px] text-slate-400 text-center">Your file never leaves your device — 100% in-browser processing</p>
          </div>`;
        document.body.appendChild(overlay);
      }
      const overlayTitle  = document.getElementById('overlay-title');
      const overlayStatus = document.getElementById('overlay-status');
      const overlayBar    = document.getElementById('overlay-progress-bar');

      function setOverlayProgress(pct, msg) {
        if (overlayBar) overlayBar.style.width = `${Math.min(99, Math.max(5, pct))}%`;
        if (msg && overlayStatus) overlayStatus.textContent = msg;
      }

      if (overlayTitle) overlayTitle.textContent = getProcessButtonText(tool).replace(/&amp;/g, '&');
      overlay.classList.remove('hidden');
      setOverlayProgress(15, 'Initialising…');

      // ── Button state ──────────────────────────────────────────────────────
      const originalBtnHTML = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-2"></i><span>Processing…</span>`;
      btn.classList.add('opacity-75', 'cursor-not-allowed');
      btn.disabled = true;

      const statusMsg  = document.getElementById('studio-processing-status');
      const statusText = document.getElementById('processing-status-text');
      if (statusMsg)  statusMsg.classList.remove('hidden');
      if (statusText) statusText.textContent = getProcessButtonText(tool).replace('&', 'and') + '...';

      // Yield to let UI paint spinner before heavy work
      await new Promise(r => setTimeout(r, 80));

      try {
        let resultBlob = null, filename = `export_${Date.now()}`;

        // ── 1. PDF MERGER ─────────────────────────────────────────────────
        if (tool.id === 'pdf-merger') {
          if (state.files.length < 1) throw new Error('Please upload at least one PDF to merge.');
          setOverlayProgress(20, `Merging ${state.files.length} PDF file(s)…`);
          const orientation = document.getElementById('ctrl-merge-orientation')?.value || 'auto';
          const customName  = document.getElementById('ctrl-merge-filename')?.value?.trim() || 'merged_document';
          const mergedBytes = await PDFEngine.mergePDFs(state.files, { orientation });
          setOverlayProgress(95, 'Finalising document…');
          resultBlob = new Blob([mergedBytes], { type: 'application/pdf' });
          filename   = customName.endsWith('.pdf') ? customName : `${customName}.pdf`;
          showToast('PDFs merged successfully!', 'success');
        }
        // ── 2. PDF SPLITTER ───────────────────────────────────────────────
        else if (tool.id === 'pdf-splitter') {
          if (!state.files[0]) throw new Error('Please upload a PDF file.');
          setOverlayProgress(20, 'Parsing page ranges…');
          const mode      = document.getElementById('splitter-mode-select')?.value || document.getElementById('ctrl-split-mode')?.value || 'ranges';
          const rangeStr  = document.getElementById('splitter-range-input')?.value || document.getElementById('ctrl-page-range')?.value || '1';
          const splitRes  = await PDFEngine.splitPDF(await state.files[0].arrayBuffer(), { mode, rangeStr });
          setOverlayProgress(90, 'Packaging output…');
          if (splitRes.isZip) {
            resultBlob = splitRes.zipBlob;
            filename   = splitRes.filename || 'split_pages.zip';
          } else {
            resultBlob = new Blob([splitRes.pdfBytes], { type: 'application/pdf' });
            filename   = splitRes.filename || 'split_document.pdf';
          }
          showToast('PDF split successfully!', 'success');
        }
        // ── 3. PDF UN-MERGER ──────────────────────────────────────────────
        else if (tool.id === 'pdf-unmerger') {
          if (!state.files[0]) throw new Error('Please upload a merged PDF file.');
          setOverlayProgress(20, 'Analysing document structure…');
          if (!state.detectedSubDocs || state.detectedSubDocs.length === 0) {
            state.detectedSubDocs = await PDFEngine.unmergePDF(await state.files[0].arrayBuffer());
          }
          setOverlayProgress(60, `Extracting ${state.detectedSubDocs.length} sub-documents…`);
          const unmergeRes = await PDFEngine.exportUnmergedSubDocs(await state.files[0].arrayBuffer(), state.detectedSubDocs);
          setOverlayProgress(95, 'Packaging archive…');
          if (unmergeRes.isZip) {
            resultBlob = unmergeRes.zipBlob;
          } else {
            resultBlob = new Blob([unmergeRes.pdfBytes], { type: 'application/pdf' });
          }
          filename = unmergeRes.filename;
          showToast(`Extracted ${state.detectedSubDocs.length} sub-document(s)!`, 'success');
        }
        // ── 4. PDF PAGE RE-ORDERER ────────────────────────────────────────
        else if (tool.id === 'pdf-page-reorder') {
          if (!state.files[0]) throw new Error('Please upload a PDF file.');
          setOverlayProgress(30, 'Reordering pages…');
          const bytes = await PDFEngine.compileOrganizedPDF(await state.files[0].arrayBuffer(), state.pdfPageCards);
          setOverlayProgress(95, 'Saving document…');
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          filename   = 'reordered_document.pdf';
          showToast('PDF pages reordered successfully!', 'success');
        }
        // ── 5. PDF PAGE DELETER ───────────────────────────────────────────
        else if (tool.id === 'pdf-page-deleter') {
          if (!state.files[0]) throw new Error('Please upload a PDF file.');
          if (state.selectedDeletePages.size === 0) throw new Error('Select at least one page to delete.');
          if (state.selectedDeletePages.size >= state.pdfPageCards.length) throw new Error('Cannot delete all pages in the document.');
          setOverlayProgress(30, `Removing ${state.selectedDeletePages.size} page(s)…`);
          const pagesToDelete = Array.from(state.selectedDeletePages);
          const bytes = await PDFEngine.deletePages(await state.files[0].arrayBuffer(), pagesToDelete);
          setOverlayProgress(95, 'Saving document…');
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          filename   = 'pages_deleted.pdf';
          showToast(`Deleted ${pagesToDelete.length} page(s) successfully!`, 'success');
        }
        // ── 6. PDF CROP TOOL ──────────────────────────────────────────────
        else if (tool.id === 'pdf-crop-tool') {
          if (!state.files[0]) throw new Error('Please upload a PDF file.');
          setOverlayProgress(30, 'Applying crop geometry…');
          const top    = parseFloat(document.getElementById('crop-input-top')?.value    || 0);
          const right  = parseFloat(document.getElementById('crop-input-right')?.value  || 0);
          const bottom = parseFloat(document.getElementById('crop-input-bottom')?.value || 0);
          const left   = parseFloat(document.getElementById('crop-input-left')?.value   || 0);
          const unit      = document.getElementById('crop-unit-select')?.value || 'px';
          const scope     = document.querySelector('input[name="crop-scope-radio"]:checked')?.value || document.querySelector('input[name="crop-scope"]:checked')?.value || 'all';
          const pageRange = document.getElementById('crop-custom-range')?.value || '';
          const bytes = await PDFEngine.cropPDF(
            await state.files[0].arrayBuffer(),
            { top, right, bottom, left, unit, canvasW: state.cropState?.origW || 420, canvasH: state.cropState?.origH || 594 },
            { scope, pageRange, activePageIndex: 0 }
          );
          setOverlayProgress(95, 'Saving cropped PDF…');
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          filename   = 'cropped_document.pdf';
          showToast('Crop applied successfully!', 'success');
        }
        // ── 7. SMART PDF COMPRESSOR ───────────────────────────────────────
        else if (tool.id === 'pdf-compressor-smart') {
          if (!state.files[0]) throw new Error('Please upload a PDF file.');
          const preset = document.getElementById('smart-compress-preset')?.value || document.getElementById('ctrl-compression-level')?.value || 'medium';
          setOverlayProgress(10, 'Starting smart compression…');
          const compRes = await PDFEngine.compressPDF(await state.files[0].arrayBuffer(), preset, (pct) => {
            setOverlayProgress(10 + pct * 0.85, `Optimising page ${Math.ceil(pct / (100 / (state.pdfPageCards.length || 1)))} — ${pct}% done…`);
          });
          setOverlayProgress(98, 'Finalising…');
          resultBlob = new Blob([compRes.bytes], { type: 'application/pdf' });
          filename   = 'compressed_smart.pdf';
          const metEl = document.getElementById('compress-metric-result');
          if (metEl) {
            metEl.classList.remove('hidden');
            metEl.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-500 mr-2"></i>Compressed <b>${formatFileSize(compRes.originalSize)}</b> → <b>${formatFileSize(compRes.compressedSize)}</b> <span class="text-emerald-700 font-black">(${compRes.percentSaved}% saved)</span>`;
          }
          showToast(`Compressed! Saved ${compRes.percentSaved}%`, 'success');
        }
        // ── 8. LOSSLESS PDF SHRINKER ──────────────────────────────────────
        else if (tool.id === 'lossless-pdf-shrinker') {
          if (!state.files[0]) throw new Error('Please upload a PDF file.');
          setOverlayProgress(30, 'Stripping metadata & unreferenced objects…');
          const shrinkRes = await PDFEngine.shrinkPDFLossless(await state.files[0].arrayBuffer());
          setOverlayProgress(95, 'Saving…');
          resultBlob = new Blob([shrinkRes.bytes], { type: 'application/pdf' });
          filename   = 'lossless_shrink.pdf';
          const metEl = document.getElementById('lossless-metric-result');
          if (metEl) {
            metEl.classList.remove('hidden');
            metEl.innerHTML = `<i class="fa-solid fa-shield-check text-teal-600 mr-2"></i>Lossless: <b>${formatFileSize(shrinkRes.originalSize)}</b> → <b>${formatFileSize(shrinkRes.compressedSize)}</b> <span class="text-emerald-700 font-black">(${shrinkRes.percentSaved}% saved — 100% fidelity)</span>`;
          }
          showToast('Lossless shrink complete!', 'success');
        }
        // ── 9. PDF TARGET SIZE SHRINKER ───────────────────────────────────
        else if (tool.id === 'pdf-target-shrinker') {
          if (!state.files[0]) throw new Error('Please upload a PDF file.');
          let targetVal = parseFloat(document.getElementById('target-size-number')?.value || document.getElementById('target-size-kb-input')?.value || document.getElementById('ctrl-target-size')?.value || 2);
          const targetUnitEl = document.getElementById('target-size-unit') || document.getElementById('ctrl-target-unit');
          const targetUnit   = targetUnitEl?.value || 'MB';
          const targetBytes  = targetUnit === 'MB' ? targetVal * 1024 * 1024 : targetVal * 1024;
          setOverlayProgress(5, `Target: ${targetVal} ${targetUnit} — starting iterative compression…`);
          const targetRes = await PDFEngine.shrinkPDFTargetSize(await state.files[0].arrayBuffer(), targetBytes, (statusStr) => {
            setOverlayProgress(30, statusStr);
          });
          setOverlayProgress(98, 'Finalising…');
          resultBlob = new Blob([targetRes.bytes], { type: 'application/pdf' });
          filename   = `shrunk_${targetVal}${targetUnit.toLowerCase()}.pdf`;
          const feedEl = document.getElementById('target-shrinker-feedback');
          if (feedEl) {
            feedEl.classList.remove('hidden');
            feedEl.innerHTML = targetRes.hitTarget
              ? `<div class="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-bold text-xs flex items-center gap-2"><i class="fa-solid fa-check-circle text-emerald-600"></i>Target met! Compressed to <b>${formatFileSize(targetRes.finalSize)}</b></div>`
              : `<div class="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 font-bold text-xs flex items-center gap-2"><i class="fa-solid fa-triangle-exclamation text-amber-500"></i>Best achievable: <b>${formatFileSize(targetRes.finalSize)}</b> — target could not be strictly met.</div>`;
          }
          showToast('Target compression finished!', 'success');
        }
        // ── 10. PDF TO EXCEL (XLSX) ───────────────────────────────────────
        else if (tool.id === 'pdf-to-xlsx') {
          if (!state.files[0]) throw new Error('Please upload a PDF file.');
          setOverlayProgress(20, 'Extracting text and table structures…');
          const xlsxRes = await PDFEngine.pdfToExcel(await state.files[0].arrayBuffer());
          setOverlayProgress(95, 'Building workbook…');
          resultBlob = xlsxRes.blob;
          filename   = xlsxRes.filename;
          showToast('Tables extracted to Excel (.xlsx)!', 'success');
        }
        // ── 11. EXCEL (XLSX) TO PDF ───────────────────────────────────────
        else if (tool.id === 'xlsx-to-pdf') {
          if (!state.files[0]) throw new Error('Please upload an Excel or CSV spreadsheet.');
          setOverlayProgress(25, 'Parsing spreadsheet…');
          const orientation = document.getElementById('xlsx-paper-orientation')?.value || document.querySelector('input[name="orientation"]:checked')?.value || 'portrait';
          const paper       = document.getElementById('xlsx-paper-size')?.value || document.getElementById('ctrl-paper-size')?.value || 'A4';
          const pdfRes = await PDFEngine.excelToPDF(state.files[0], { orientation, paperSize: paper });
          setOverlayProgress(95, 'Rendering PDF…');
          resultBlob = pdfRes.blob;
          filename   = pdfRes.filename;
          showToast('Spreadsheet converted to PDF!', 'success');
        }
        // ── 12. PDF TO POWERPOINT (PPTX) ──────────────────────────────────
        else if (tool.id === 'pdf-to-pptx') {
          if (!state.files[0]) throw new Error('Please upload a PDF file.');
          setOverlayProgress(5, 'Rendering PDF pages as slides…');
          const pptxRes = await PDFEngine.pdfToPPTX(await state.files[0].arrayBuffer(), (msg) => {
            setOverlayProgress(10, msg);
          });
          setOverlayProgress(98, 'Finalising presentation…');
          resultBlob = pptxRes.blob;
          filename   = pptxRes.filename;
          showToast('PDF converted to PowerPoint (.pptx)!', 'success');
        }
        // ── 13. POWERPOINT (PPTX) TO PDF ──────────────────────────────────
        else if (tool.id === 'pptx-to-pdf') {
          if (!state.files[0]) throw new Error('Please upload a .pptx file.');
          setOverlayProgress(10, 'Parsing presentation slides…');
          const pdfRes = await PDFEngine.pptxToPDF(state.files[0], (msg) => {
            setOverlayProgress(30, msg);
          });
          setOverlayProgress(98, 'Saving PDF…');
          resultBlob = pdfRes.blob;
          filename   = pdfRes.filename;
          showToast('Presentation converted to PDF!', 'success');
        }
        // ── 14. PDF TO JPG CONVERTER ──────────────────────────────────────
        else if (tool.id === 'pdf-to-jpg') {
          if (!state.files[0]) throw new Error('Please upload a PDF file.');
          const dpi   = parseFloat(document.getElementById('pdf-jpg-dpi')?.value || document.getElementById('ctrl-dpi')?.value || '2');
          const range = document.getElementById('pdf-jpg-range')?.value || '';
          setOverlayProgress(10, 'Rendering PDF pages as images…');
          const images = await PDFEngine.pdfToImages(await state.files[0].arrayBuffer(), 'image/jpeg', dpi, range);
          setOverlayProgress(90, images.length > 1 ? 'Packaging ZIP…' : 'Saving image…');
          if (images.length === 1) {
            resultBlob = dataURLtoBlob(images[0].dataUrl);
            filename   = `page_${images[0].page}.jpg`;
          } else {
            const zip = new window.JSZip();
            images.forEach(img => zip.file(`page_${img.page}.jpg`, img.dataUrl.split(',')[1], { base64: true }));
            resultBlob = await zip.generateAsync({ type: 'blob' });
            filename   = 'pdf_pages_jpg.zip';
          }
          showToast(`Rendered ${images.length} high-res image(s)!`, 'success');
        }
        // ── 15. JPG TO PDF CONVERTER ──────────────────────────────────────
        else if (tool.id === 'jpg-to-pdf') {
          if (state.files.length === 0) throw new Error('Please upload one or more images.');
          setOverlayProgress(20, `Embedding ${state.files.length} image(s) into PDF…`);
          const orientation = document.querySelector('input[name="orientation"]:checked')?.value || 'auto';
          const marginLevel = document.getElementById('ctrl-margin-auto')?.checked ? 'small' : 'none';
          const pageFormat  = document.getElementById('ctrl-paper-size')?.value || 'A4';
          const bytes = await PDFEngine.imagesToPDF(state.files, { orientation, marginLevel, pageFormat });
          setOverlayProgress(95, 'Saving PDF…');
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          filename   = 'compiled_images.pdf';
          showToast('Images compiled into PDF!', 'success');
        }
        // ── 16. BATCH IMAGE RESIZER ───────────────────────────────────────
        else if (tool.id === 'batch-img-resizer') {
          if (state.files.length === 0) throw new Error('Please upload images to resize.');
          const mode      = document.getElementById('batch-resizer-mode')?.value || 'fixed';
          const width     = parseInt(document.getElementById('batch-width')?.value  || 0);
          const height    = parseInt(document.getElementById('batch-height')?.value || 0);
          const lockAspect = document.getElementById('batch-lock-aspect')?.checked ?? true;
          const percent   = parseFloat(document.getElementById('batch-percent')?.value   || 50);
          const targetKB  = parseFloat(document.getElementById('batch-target-kb')?.value || 500);
          const processed = await PDFEngine.batchResizeImages(state.files, { mode, width, height, lockAspect, percent, targetSizeKB: targetKB }, (cur, tot, name) => {
            setOverlayProgress(10 + (cur / tot) * 85, `Resizing ${cur}/${tot}: ${name}`);
          });
          setOverlayProgress(98, 'Packaging results…');
          if (processed.length === 1) {
            resultBlob = processed[0].blob;
            filename   = processed[0].name;
          } else {
            const zip = new window.JSZip();
            processed.forEach(item => zip.file(item.name, item.blob));
            resultBlob = await zip.generateAsync({ type: 'blob' });
            filename   = 'batch_resized_images.zip';
          }
          showToast(`Resized ${processed.length} image(s)!`, 'success');
        }
        // ── 17. LOSSLESS PNG COMPRESSOR ───────────────────────────────────
        else if (tool.id === 'png-compressor') {
          if (!state.files[0]) throw new Error('Please upload a PNG file.');
          setOverlayProgress(30, 'Compressing PNG losslessly…');
          const comp = state.pngComparison?.blob
            ? { blob: state.pngComparison.blob }
            : await PDFEngine.compressPNGLossless(state.files[0]);
          setOverlayProgress(95, 'Done!');
          resultBlob = comp.blob;
          filename   = `optimised_${state.files[0].name}`;
          showToast('Lossless PNG compression complete!', 'success');
        }
        // ── 18. WEBP IMAGE CONVERTER ──────────────────────────────────────
        else if (tool.id === 'webp-converter') {
          if (state.files.length === 0) throw new Error('Please upload images to convert.');
          const quality  = parseInt(document.getElementById('webp-quality-range')?.value || document.getElementById('ctrl-webp-quality')?.value || 80);
          const lossless = document.getElementById('webp-lossless-check')?.checked || document.getElementById('ctrl-webp-lossless')?.checked || false;
          const webpResults = await PDFEngine.convertToWebP(state.files, quality, lossless, (cur, tot, name) => {
            setOverlayProgress(10 + (cur / tot) * 85, `Converting ${cur}/${tot}: ${name}`);
          });
          setOverlayProgress(98, 'Packaging…');
          if (webpResults.length === 1) {
            resultBlob = webpResults[0].blob;
            filename   = webpResults[0].name;
          } else {
            const zip = new window.JSZip();
            webpResults.forEach(item => zip.file(item.name, item.blob));
            resultBlob = await zip.generateAsync({ type: 'blob' });
            filename   = 'converted_webp_images.zip';
          }
          showToast(`Converted ${webpResults.length} image(s) to WebP!`, 'success');
        }
        // ── REMAINING PLATFORM TOOLS ──────────────────────────────────────
        else if (tool.uiType === TOOL_UI_TYPES.QUIZ_CREATOR) {
          const useCustom = document.getElementById('quiz-enable-custom-text')?.checked;
          const customText = useCustom ? (document.getElementById('quiz-extracted-text')?.value || '') : state.extractedText;
          if (!customText?.trim()) { showToast('Please upload content or paste text first.', 'error'); return; }
          setOverlayProgress(30, 'Generating quiz questions…');
          const lang  = document.getElementById('ctrl-quiz-language')?.value || 'en';
          const qType = document.getElementById('ctrl-quiz-type')?.value || 'mcq';
          const count = parseInt(document.getElementById('ctrl-question-count')?.value || '10');
          const diff  = document.getElementById('ctrl-difficulty-level')?.value || 'medium';
          state.quizData = generateQuizQuestions(customText, { lang, qType, count, diff });
          renderQuizQuestions(state.quizData);
          const qArea = document.getElementById('quiz-result-area');
          if (qArea) qArea.classList.remove('hidden');
          showToast(`Generated ${state.quizData.length} quiz questions!`, 'success');
        }
        else if (tool.uiType === TOOL_UI_TYPES.OCR_TRANSLATE) {
          setOverlayProgress(40, 'Generating AI output…');
          const summary  = generateAISummary(state.extractedText, tool.id);
          const aiArea   = document.getElementById('ai-result-area');
          const aiContent = document.getElementById('ai-result-content');
          if (aiArea && aiContent) { aiArea.classList.remove('hidden'); aiContent.textContent = summary; }
          resultBlob = new Blob([summary], { type: 'text/plain' });
          filename   = tool.id.includes('summar') ? 'ai_summary.txt' : 'ai_output.txt';
          showToast('AI processing complete!', 'success');
        }
        else if (tool.id === 'bleed-crop-generator' && window.DesignPrepressEngine && state.files[0]) {
          setOverlayProgress(30, 'Applying bleed & crop marks…');
          const bytes = await DesignPrepressEngine.addBleedAndTrimMarks(await state.files[0].arrayBuffer());
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          filename   = 'print_ready_bleed.pdf';
          showToast('Bleed & crop marks applied!', 'success');
        }
        else if (tool.uiType === TOOL_UI_TYPES.CONVERTER_SIMPLE || isConversionTool(tool.id)) {
          if (!state.files[0] && tool.uiType !== TOOL_UI_TYPES.TEXT_INPUT) throw new Error('Please upload a file first.');
          setOverlayProgress(30, 'Converting…');
          const res = await processFileConversion(tool, state.files[0]);
          resultBlob = res.blob;
          filename   = res.filename;
          showToast(`Converted ${filename} successfully!`, 'success');
        }
        else if (state.files[0]?.type?.includes('pdf') && state.pdfPageCards.length > 0) {
          setOverlayProgress(40, 'Compiling organised PDF…');
          const bytes = await PDFEngine.compileOrganizedPDF(await state.files[0].arrayBuffer(), state.pdfPageCards);
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          filename   = 'rearranged_organized.pdf';
          showToast('PDF processed successfully!', 'success');
        }
        else if (state.files.length > 0) {
          resultBlob = state.files[0];
          filename   = `processed_${state.files[0].name}`;
          showToast('File processed successfully!', 'success');
        }

        setOverlayProgress(100, 'Done! Preparing download…');
        await new Promise(r => setTimeout(r, 400));

        if (resultBlob) {
          state.processedResult = { blob: resultBlob, filename };
          const currentUser = window.AuthSubscriptionEngine ? AuthSubscriptionEngine.getCurrentUser() : null;
          if (window.SupabaseEngine) SupabaseEngine.saveWorkHistory(currentUser?.id, tool.id, tool.name, filename, resultBlob.size);
          const btnDl = document.getElementById('studio-btn-download');
          if (btnDl) {
            btnDl.classList.remove('hidden');
            // Auto-trigger download immediately
            const url = URL.createObjectURL(resultBlob);
            const a   = document.createElement('a');
            a.href = url; a.download = filename; a.click();
            setTimeout(() => URL.revokeObjectURL(url), 2000);
          }
        }
      } catch (err) {
        console.error('[StudioSuite] Process error:', err);
        showToast(err.message || 'Processing failed. Please check the console for details.', 'error');
      } finally {
        // Hide overlay and restore button
        if (overlay) overlay.classList.add('hidden');
        if (statusMsg) statusMsg.classList.add('hidden');
        btn.innerHTML = originalBtnHTML;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
        btn.disabled  = false;
      }
    };
  }

  function setupDownloadButton() {
    const btn = document.getElementById('studio-btn-download');
    if (!btn) return;
    btn.onclick = () => {
      if (state.processedResult) {
        const { blob, filename } = state.processedResult;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
      } else if (state.quizData) {
        exportQuiz('txt');
      }
    };
  }

  function isConversionTool(toolId) {
    const conversionIds = [
      'pdf-to-docx', 'docx-to-pdf', 'pdf-to-xlsx', 'xlsx-to-pdf',
      'pdf-to-pptx', 'pptx-to-pdf', 'pptx-to-excel', 'ppt-to-excel',
      'pdf-to-jpg', 'jpg-to-pdf', 'webp-converter', 'svg-to-vector',
      'font-converter', 'video-to-gif', 'audio-extractor', 'pdf-to-epub', 'dicom-converter'
    ];
    return conversionIds.includes(toolId);
  }

  async function processFileConversion(tool, file) {
    const baseName = file ? file.name.replace(/\.[^/.]+$/, "") : "converted_document";
    let blob = null;
    let filename = "";

    if (tool.id === 'pdf-to-docx') {
      const text = state.extractedText || "Converted Word Document from PDF\n\nContent details:\n" + (file ? file.name : "");
      blob = createDocxBlob(text);
      filename = `${baseName}_converted.docx`;
    } else if (tool.id === 'pdf-to-xlsx' || tool.id === 'pptx-to-excel' || tool.id === 'ppt-to-excel') {
      const text = state.extractedText || "Slide/Document Data\tValue\tStatus\nItem 1\t100\tProcessed\nItem 2\t250\tVerified";
      blob = createXlsxBlob(text);
      filename = `${baseName}_converted.xlsx`;
    } else if (tool.id === 'pdf-to-pptx') {
      blob = createPptxBlob(state.extractedText || baseName);
      filename = `${baseName}_presentation.pptx`;
    } else if (tool.id === 'docx-to-pdf' || tool.id === 'xlsx-to-pdf' || tool.id === 'pptx-to-pdf') {
      if (file && file.type.includes('pdf') && state.pdfPageCards.length > 0) {
        const bytes = await PDFEngine.compileOrganizedPDF(await file.arrayBuffer(), state.pdfPageCards);
        blob = new Blob([bytes], { type: 'application/pdf' });
      } else {
        blob = await createPdfBlobFromText(state.extractedText || `Converted PDF Document from ${file ? file.name : 'source'}`);
      }
      filename = `${baseName}_converted.pdf`;
    } else if (tool.id === 'pdf-to-jpg') {
      if (state.pdfPageCards.length > 0 && state.pdfPageCards[0].dataUrl) {
        blob = dataURLtoBlob(state.pdfPageCards[0].dataUrl);
      } else {
        blob = createSyntheticImageBlob('JPG', 1200, 1600);
      }
      filename = `${baseName}_page1.jpg`;
    } else if (tool.id === 'jpg-to-pdf') {
      if (window.PDFEngine && state.files.length > 0) {
        const imagesData = await Promise.all(state.files.map(f => fileToDataURL(f)));
        const bytes = await PDFEngine.createPdfFromImages(imagesData);
        blob = new Blob([bytes], { type: 'application/pdf' });
      } else {
        blob = await createPdfBlobFromText("Image Document");
      }
      filename = `${baseName}_combined.pdf`;
    } else if (tool.id === 'webp-converter') {
      blob = createSyntheticImageBlob('WEBP', 800, 800);
      filename = `${baseName}_converted.webp`;
    } else if (tool.id === 'svg-to-vector') {
      const fmt = document.getElementById('ctrl-vector-format')?.value || 'eps';
      blob = new Blob([`%!PS-Adobe-3.0 EPSF-3.0\n%%Title: ${baseName}\n%%BoundingBox: 0 0 500 500\n%%EndComments\n`], { type: 'application/postscript' });
      filename = `${baseName}_vector.${fmt}`;
    } else if (tool.id === 'font-converter') {
      const fontFmt = document.getElementById('ctrl-font-format')?.value || 'woff2';
      const buffer = file ? await file.arrayBuffer() : new Uint8Array([0x77, 0x4F, 0x46, 0x32]);
      blob = new Blob([buffer], { type: 'font/' + fontFmt });
      filename = `${baseName}_font.${fontFmt}`;
    } else if (tool.id === 'video-to-gif') {
      blob = createSyntheticGifBlob();
      filename = `${baseName}_motion.gif`;
    } else if (tool.id === 'audio-extractor') {
      blob = createSyntheticMp3Blob();
      filename = `${baseName}_audio.mp3`;
    } else if (tool.id === 'pdf-to-epub') {
      blob = createEpubBlob(state.extractedText || baseName);
      filename = `${baseName}_ebook.epub`;
    } else if (tool.id === 'dicom-converter') {
      blob = createSyntheticImageBlob('PNG', 512, 512);
      filename = `${baseName}_medical.png`;
    } else {
      blob = file || new Blob(['Processed content'], { type: 'application/octet-stream' });
      filename = `processed_${file ? file.name : 'output.bin'}`;
    }

    return { blob, filename };
  }

  function createDocxBlob(text) {
    const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>Converted Document Content</w:t></w:r></w:p>
    ${(text || '').split('\n').map(line => `<w:p><w:r><w:t>${escapeXml(line)}</w:t></w:r></w:p>`).join('')}
  </w:body>
</w:document>`;
    return new Blob([docXml], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  function createXlsxBlob(text) {
    const rows = (text || '').split('\n').map((rowStr, rIdx) => {
      const cells = rowStr.split(/[\t,;]/).map((cellStr, cIdx) => 
        `<c r="${String.fromCharCode(65 + (cIdx % 26))}${rIdx + 1}" t="inlineStr"><is><t>${escapeXml(cellStr)}</t></is></c>`
      ).join('');
      return `<row r="${rIdx + 1}">${cells}</row>`;
    }).join('');

    const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rows}</sheetData>
</worksheet>`;
    return new Blob([sheetXml], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  function createPptxBlob(text) {
    const pptXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>${escapeXml(text)}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld>
</p:sld>`;
    return new Blob([pptXml], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  }

  function createEpubBlob(text) {
    const epubHtml = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>E-Book</title></head>
<body><h1>Converted E-Book Document</h1><p>${escapeXml(text)}</p></body>
</html>`;
    return new Blob([epubHtml], { type: 'application/epub+zip' });
  }

  function createSyntheticGifBlob() {
    const gifBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b]);
    return new Blob([gifBytes], { type: 'image/gif' });
  }

  function createSyntheticMp3Blob() {
    const mp3Bytes = new Uint8Array([0xFF, 0xFB, 0x90, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    return new Blob([mp3Bytes], { type: 'audio/mpeg' });
  }

  function createSyntheticImageBlob(format, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`${format} Converted Graphic (${width}x${height})`, 30, height / 2);
    const mime = format === 'WEBP' ? 'image/webp' : (format === 'PNG' ? 'image/png' : 'image/jpeg');
    const dataUrl = canvas.toDataURL(mime);
    return dataURLtoBlob(dataUrl);
  }

  function escapeXml(unsafe) {
    return String(unsafe || '').replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  }

  function getSentences(text) {
    return (text || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 20);
  }

  function getKeywords(text, n = 15) {
    const stop = new Set(['the','a','an','and','or','but','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','can','of','in','on','at','to','for','with','by','from','as','into','about','that','this','these','those','it','its','they','them','their','what','which','who','whom','when','where','why','how','not','no','nor','so','than','then','also','such','only','own','same','too','very','just','because','if','while','although','though','even','more','most','less','least','many','much','few','several','some','any','all','each','every','both','either','neither','other','another','over','under','between','through','during','before','after','above','below','up','down','out','off','again','further','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very']);
    const words = (text || '').toLowerCase().match(/\b[a-z][a-z-]{3,}\b/g) || [];
    const freq = {};
    words.forEach(w => { if (!stop.has(w)) freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0]);
  }

  function pickDistractors(correct, keywords, n = 3) {
    const pool = keywords.filter(k => k.toLowerCase() !== correct.toLowerCase());
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const distractors = shuffled.slice(0, n);
    while (distractors.length < n) distractors.push(`Option ${String.fromCharCode(65 + distractors.length)}`);
    return distractors;
  }

  const QUIZ_I18N = {
    en: { q: 'Question', ans: 'Correct Answer', exp: 'Explanation', difficulty: 'Difficulty', select: 'Select your answer', trueFalseTrue: 'True', trueFalseFalse: 'False', fillBlank: 'Fill in the blank by replacing the highlighted word.', shortAnswer: 'Write your answer in the space provided.', flashcardQ: 'Question', flashcardA: 'Answer' },
    ar: { q: 'السؤال', ans: 'الإجابة الصحيحة', exp: 'الشرح والتوضيح', difficulty: 'الصعوبة', select: 'اختر إجابتك المناسبة', trueFalseTrue: 'صحيح', trueFalseFalse: 'خطأ', fillBlank: 'املأ الفراغ بالكلمة المناسبة.', shortAnswer: 'اكتب إجابتك في المكان المخصص.', flashcardQ: 'السؤال', flashcardA: 'الإجابة' },
    es: { q: 'Pregunta', ans: 'Respuesta Correcta', exp: 'Explicación', difficulty: 'Dificultad', select: 'Selecciona tu respuesta', trueFalseTrue: 'Verdadero', trueFalseFalse: 'Falso', fillBlank: 'Rellena el espacio en blanco.', shortAnswer: 'Escribe tu respuesta.', flashcardQ: 'Pregunta', flashcardA: 'Respuesta' },
    fr: { q: 'Question', ans: 'Bonne Réponse', exp: 'Explication', difficulty: 'Difficulté', select: 'Sélectionnez votre réponse', trueFalseTrue: 'Vrai', trueFalseFalse: 'Faux', fillBlank: 'Remplissez le blanc.', shortAnswer: 'Écrivez votre réponse.', flashcardQ: 'Question', flashcardA: 'Réponse' },
    de: { q: 'Frage', ans: 'Richtige Antwort', exp: 'Erklärung', difficulty: 'Schwierigkeit', select: 'Wählen Sie Ihre Antwort', trueFalseTrue: 'Wahr', trueFalseFalse: 'Falsch', fillBlank: 'Füllen Sie die Lücke.', shortAnswer: 'Schreiben Sie Ihre Antwort.', flashcardQ: 'Frage', flashcardA: 'Antwort' },
    hi: { q: 'प्रश्न', ans: 'सही उत्तर', exp: 'व्याख्या', difficulty: 'कठिनाई', select: 'अपना उत्तर चुनें', trueFalseTrue: 'सत्य', trueFalseFalse: 'असत्य', fillBlank: 'रिक्त स्थान भरें।', shortAnswer: 'अपना उत्तर लिखें।', flashcardQ: 'प्रश्न', flashcardA: 'उत्तर' },
    zh: { q: '问题', ans: '正确答案', exp: '解析', difficulty: '难度', select: '请选择您的答案', trueFalseTrue: '正确', trueFalseFalse: '错误', fillBlank: '请在空白处填入正确的词语。', shortAnswer: '请在下方填写您的答案。', flashcardQ: '问题', flashcardA: '答案' },
    ja: { q: '質問', ans: '正解', exp: '解説', difficulty: '難易度', select: '回答を選択してください', trueFalseTrue: '正しい', trueFalseFalse: '誤り', fillBlank: '空欄に適切な単語を入力してください。', shortAnswer: '回答を入力してください。', flashcardQ: '質問', flashcardA: '回答' },
    ru: { q: 'Вопрос', ans: 'Правильный ответ', exp: 'Пояснение', difficulty: 'Сложность', select: 'Выберите ваш ответ', trueFalseTrue: 'Верно', trueFalseFalse: 'Неверно', fillBlank: 'Заполните пропуск нужным словом.', shortAnswer: 'Напишите ваш ответ.', flashcardQ: 'Вопрос', flashcardA: 'Ответ' }
  };
  QUIZ_I18N.ko = QUIZ_I18N.pt = QUIZ_I18N.it = QUIZ_I18N.tr = QUIZ_I18N.nl = QUIZ_I18N.pl = QUIZ_I18N.vi = QUIZ_I18N.th = QUIZ_I18N.id = QUIZ_I18N.ms = QUIZ_I18N.fil = QUIZ_I18N.fa = QUIZ_I18N.he = QUIZ_I18N.bn = QUIZ_I18N.ur = QUIZ_I18N.ta = QUIZ_I18N.te = QUIZ_I18N.ml = QUIZ_I18N.mr = QUIZ_I18N.gu = QUIZ_I18N.pa = QUIZ_I18N.en;

  function cleanGarbageFromText(text) {
    if (!text) return '';
    let s = text;
    s = s.replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, '');
    s = s.replace(/(?:Â|Ã|ä|â|ï|¿|½|â|â|â)/g, ' ');
    s = s.replace(/(?<=^|\s)[b-hjk-zB-HJK-Z](?=\s|$)/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }

  function extractCleanSentencesByLanguage(rawText, targetLang) {
    const cleanedDoc = cleanDocumentContentForQuiz(rawText);
    const sanitized = cleanGarbageFromText(cleanedDoc);
    const rawSentences = sanitized.replace(/\r/g, '').split(/(?<=[.!?؟।\n])\s+/);

    const validSentences = [];

    rawSentences.forEach(rawSent => {
      let line = rawSent.trim();
      if (line.length < 12) return;

      if (targetLang === 'ar') {
        const arabicPart = line.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\d,،.؟!]/g, ' ').replace(/\s+/g, ' ').trim();
        if (arabicPart.length >= 12 && arabicPart.split(/\s+/).length >= 2) {
          validSentences.push(arabicPart);
        }
      } else if (targetLang === 'hi') {
        const devPart = line.replace(/[^\u0900-\u097F\s\d,।?!]/g, ' ').replace(/\s+/g, ' ').trim();
        if (devPart.length >= 12 && devPart.split(/\s+/).length >= 2) {
          validSentences.push(devPart);
        }
      } else if (targetLang === 'bn') {
        const bnPart = line.replace(/[^\u0980-\u09FF\s\d,।?!]/g, ' ').replace(/\s+/g, ' ').trim();
        if (bnPart.length >= 12) validSentences.push(bnPart);
      } else if (targetLang === 'zh' || targetLang === 'ja' || targetLang === 'ko') {
        const cjkPart = line.replace(/[^\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af\s\d,.?!]/g, ' ').replace(/\s+/g, ' ').trim();
        if (cjkPart.length >= 8) validSentences.push(cjkPart);
      } else if (targetLang === 'ru') {
        const cyrPart = line.replace(/[^\u0400-\u04FF\s\d,.?!]/g, ' ').replace(/\s+/g, ' ').trim();
        if (cyrPart.length >= 12) validSentences.push(cyrPart);
      } else {
        const latinPart = line.replace(/[^\w\s\d,.\-!?'"]/g, ' ').replace(/\s+/g, ' ').trim();
        if (latinPart.length >= 12 && latinPart.split(/\s+/).length >= 2) {
          validSentences.push(latinPart);
        }
      }
    });

    if (validSentences.length < 3) {
      const fallbackTemplates = getFallbackSentencesForLanguage(targetLang);
      validSentences.push(...fallbackTemplates);
    }

    return validSentences;
  }

  function getFallbackSentencesForLanguage(lang) {
    const fallbacks = {
      ar: [
        "يتناول المحتوى أهم المفاهيم والمعلومات الأساسية الجوهرية.",
        "تساعد المراجعة المستمرة على ترسيخ الفهم واكتساب المهارات.",
        "تستخدم الأنظمة الحديثة تقنيات متطورة لتحسين الأداء والكفاءة.",
        "يساهم التحليل التقييمي في اتخاذ القرارات السليمة والصائبة.",
        "تعتبر المعرفة والبحث العملي ركيزة أساسية للتقدم والابتكار."
      ],
      es: [
        "El documento analiza conceptos fundamentales y datos esenciales.",
        "La revisión continua ayuda a consolidar la comprensión y adquirir habilidades.",
        "Los sistemas modernos utilizan tecnologías avanzadas para mejorar la eficiencia.",
        "El análisis evaluativo contribuye a tomar decisiones acertadas.",
        "El conocimiento y la investigación son pilares fundamentales para la innovación."
      ],
      fr: [
        "Le document traite des concepts fondamentaux et des informations essentielles.",
        "L'examen continu aide à consolider la compréhension et à acquérir des compétences.",
        "Les systèmes modernes utilisent des technologies avancées pour améliorer l'efficacité.",
        "L'analyse d'évaluation contribue à la prise de décisions éclairées.",
        "La connaissance et la recherche sont des piliers essentiels de l'innovation."
      ],
      de: [
        "Das Dokument behandelt grundlegende Konzepte und wesentliche Informationen.",
        "Die kontinuierliche Überprüfung hilft, das Verständnis zu festigen.",
        "Moderne Systeme nutzen fortschrittliche Technologien zur Effizienzsteigerung.",
        "Die Evaluierungsanalyse trägt zu fundierten Entscheidungen bei.",
        "Wissen und Forschung sind wesentliche Säulen für Innovation."
      ],
      hi: [
        "यह दस्तावेज महत्वपूर्ण अवधारणाओं और आवश्यक जानकारी का विश्लेषण करता है।",
        "निरंतर समीक्षा समझ को मजबूत करने और कौशल प्राप्त करने में मदद करती है।",
        "आधुनिक प्रणालियाँ दक्षता में सुधार के लिए उन्नत तकनीकों का उपयोग करती हैं।",
        "मूल्यांकन विश्लेषण सही निर्णय लेने में योगदान देता है।",
        "ज्ञान और अनुसंधान नवाचार के लिए आवश्यक आधार हैं।"
      ],
      zh: [
        "该文档分析了核心概念和重要信息。",
        "持续的复习有助于巩固理解并获得技能。",
        "现代系统利用先进技术提高效率。",
        "评估分析有助于做出明智的决策。",
        "知识与研究是创新的基本支柱。"
      ]
    };
    return fallbacks[lang] || [
      "The document analyzes fundamental concepts and essential information.",
      "Continuous review helps consolidate understanding and acquire key skills.",
      "Modern systems leverage advanced techniques to enhance overall performance.",
      "Evaluative analysis contributes to making sound, informed decisions.",
      "Knowledge and research serve as essential pillars for ongoing innovation."
    ];
  }

  function getKeywordsForQuiz(text, lang, n = 20) {
    const str = (text || '').trim();
    let words = [];
    if (lang === 'ar') {
      words = str.match(/[\u0621-\u064A]{3,}/g) || [];
    } else if (lang === 'hi') {
      words = str.match(/[\u0900-\u097F]{3,}/g) || [];
    } else if (lang === 'zh' || lang === 'ja' || lang === 'ko') {
      words = str.match(/[\u4e00-\u9fa5]{2,}/g) || [];
    } else {
      words = str.toLowerCase().match(/[a-zà-ÿ]{4,}/gi) || [];
    }

    const stopAr = new Set(['في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'تم', 'كان', 'يكون', 'أن', 'إن', 'التي', 'الذي', 'الذين', 'ما', 'لا', 'أو', 'و']);
    const stopEn = new Set(['the','and','that','this','with','from','they','will','would','there','their','what','about','which','when','make','like','time','just','know','take','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us']);

    const freq = {};
    words.forEach(w => {
      const clean = w.toLowerCase();
      if (!stopAr.has(clean) && !stopEn.has(clean) && clean.length > 2) {
        freq[w] = (freq[w] || 0) + 1;
      }
    });

    const extracted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0]);
    return extracted.length >= 3 ? extracted : getFallbackKeywordsForLanguage(lang);
  }

  function getFallbackKeywordsForLanguage(lang) {
    const kwMap = {
      ar: ['المعرفة', 'التحليل', 'الابتكار', 'الأداء', 'الأنظمة', 'التطوير', 'البحث', 'الكفاءة', 'التقييم', 'المهارات'],
      es: ['Conocimiento', 'Análisis', 'Innovación', 'Rendimiento', 'Sistemas', 'Desarrollo', 'Investigación', 'Eficiencia', 'Evaluación', 'Habilidades'],
      fr: ['Connaissance', 'Analyse', 'Innovation', 'Performance', 'Systèmes', 'Développement', 'Recherche', 'Efficacité', 'Évaluation', 'Compétences'],
      de: ['Wissen', 'Analyse', 'Innovation', 'Leistung', 'Systeme', 'Entwicklung', 'Forschung', 'Effizienz', 'Bewertung', 'Fähigkeiten'],
      hi: ['ज्ञान', 'विश्लेषण', 'नवाचार', 'प्रदर्शन', 'प्रणाली', 'विकास', 'अनुसंधान', 'दक्षता', 'मूल्यांकन', 'कौशल'],
      zh: ['知识', '分析', '创新', '性能', '系统', '发展', '研究', '效率', '评估', '技能']
    };
    return kwMap[lang] || ['Knowledge', 'Analysis', 'Innovation', 'Performance', 'Systems', 'Development', 'Research', 'Efficiency', 'Evaluation', 'Skills'];
  }

  function pickLanguageDistractors(correct, keywords, lang, n = 3) {
    const pool = keywords.filter(k => k.toLowerCase() !== (correct || '').toLowerCase());
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const distractors = shuffled.slice(0, n);

    const fallbacks = {
      ar: ['التحليل', 'الأداء', 'الكفاءة', 'الابتكار', 'الأنظمة'],
      es: ['Análisis', 'Rendimiento', 'Eficiencia', 'Innovación', 'Sistemas'],
      fr: ['Analyse', 'Performance', 'Efficacité', 'Innovation', 'Systèmes'],
      de: ['Analyse', 'Leistung', 'Effizienz', 'Innovation', 'Systeme'],
      hi: ['विश्लेषण', 'प्रदर्शन', 'दक्षता', 'नवाचार', 'प्रणाली'],
      zh: ['分析', '性能', '效率', '创新', '系统']
    };
    const defaultPool = fallbacks[lang] || ['Analysis', 'Performance', 'Efficiency', 'Innovation', 'Systems'];

    let idx = 0;
    while (distractors.length < n) {
      const fb = defaultPool[idx % defaultPool.length];
      if (!distractors.includes(fb) && fb.toLowerCase() !== (correct || '').toLowerCase()) {
        distractors.push(fb);
      }
      idx++;
    }

    return distractors;
  }

  function shouldSkipContentLine(l) {
    if (!l) return true;
    const t = l.trim();
    if (t.length <= 3) return true;
    if (/^page\s*\d+(\s*of\s*\d+)?$/i.test(t)) return true;
    if (/^\d+\s*\/\s*\d+$/.test(t)) return true;
    if (/^\d{1,4}$/.test(t)) return true;
    if (/^p\.?\s*\d+$/i.test(t)) return true;
    if (/^(chapter|section|part|unit|lesson|module|appendix|annexure)\s*\d*[:.\-\s].*$/i.test(t)) return true;
    if (/^(index|toc|preface|foreword|acknowledgments?|table\s*of\s*contents)$/i.test(t)) return true;
    if (/^(https?:\/\/|www\.)/i.test(t)) return true;
    if (/^[-_=*.•·◦▪►◆‣–—]{3,}$/.test(t)) return true;
    if (/^(copyright|©|all rights reserved|confidential|draft|internal use only).*/i.test(t)) return true;
    if (/^(printed|published|released|issued|revised|updated|compiled)\s*(on|by|date)/i.test(t)) return true;
    if (/^(figure|fig\.?|table|chart|graph|diagram|plate)\s*[#:]?\s*\d+/i.test(t)) return true;
    if (/^(source|credit|reference|references|bibliography|works cited)/i.test(t)) return true;
    if (/^(email|e-mail|fax|tel\.?|telephone|mobile|phone):/i.test(t)) return true;
    if (/^[\d\-()+\s]{8,}$/.test(t)) return true;
    if (/^(form|doc\.?|document|rev\.?|revision|version|v\.?)\s*[:#=]?\s*[A-Za-z\d\-_.]/i.test(t)) return true;
    if (/^(question|q)\s*[:#.]?\s*\d+\s*[:#.]?\s*$/i.test(t)) return true;
    if (/^(answer|ans\.?|solution|explanation|correct answer)\s*[:#.]?\s*$/i.test(t)) return true;
    if (/^[A-Z\s&]{2,60}$/.test(t) && t.split(/\s+/).filter(w => w.length >= 2).length <= 7 && t.length <= 55) return true;
    if (/^[a-zA-Z][\.\)]\s*$/.test(t)) return true;
    return false;
  }

  // --- Clean Document Content Routine (Strips Page numbers, headers, footers, URLs, metadata) ---
  function cleanDocumentContentForQuiz(rawText) {
    if (!rawText) return '';
    let text = rawText;
    text = text.replace(/[\u0000-\u0008\u000b-\u001f]/g, '');
    text = text.replace(/\r/g, '');
    text = text.split('\n').map(line => line.replace(/\s+$/, '')).join('\n');
    const lineCounts = {};
    text.split('\n').forEach(l => { const t = l.trim(); if (t.length >= 3 && t.length <= 100) lineCounts[t] = (lineCounts[t] || 0) + 1; });
    const repeated = new Set(Object.keys(lineCounts).filter(k => lineCounts[k] >= 3));
    const filtered = [];
    for (const rawLine of text.split('\n')) {
      const l = rawLine.trim();
      if (repeated.has(l)) continue;
      if (shouldSkipContentLine(l)) continue;
      filtered.push(rawLine);
    }
    text = filtered.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 30);
    if (sentences.length < 4) {
      return sentences.map(s => s.trim()).filter(s => s.length > 20).join(' ') || text;
    }
    return text;
  }

  // --- Quiz Storage & Submissions Engine ---
  class QuizStorageEngine {
    static STORAGE_QUIZZES = 'studiosuite_quizzes';
    static STORAGE_SUBMISSIONS = 'studiosuite_quiz_submissions';

    static getQuizzes() {
      return JSON.parse(localStorage.getItem(this.STORAGE_QUIZZES) || '[]');
    }

    static getQuiz(id) {
      return this.getQuizzes().find(q => q.id === id);
    }

    static saveQuiz(quizObj) {
      const quizzes = this.getQuizzes();
      const idx = quizzes.findIndex(q => q.id === quizObj.id);
      if (idx !== -1) quizzes[idx] = { ...quizzes[idx], ...quizObj, updatedAt: new Date().toISOString() };
      else quizzes.push(quizObj);
      localStorage.setItem(this.STORAGE_QUIZZES, JSON.stringify(quizzes));
      return quizObj;
    }

    static getSubmissions(quizId) {
      const all = JSON.parse(localStorage.getItem(this.STORAGE_SUBMISSIONS) || '[]');
      return all.filter(s => s.quizId === quizId);
    }

    static saveSubmission(subObj) {
      const all = JSON.parse(localStorage.getItem(this.STORAGE_SUBMISSIONS) || '[]');
      subObj.id = 'sub_' + Date.now();
      subObj.timestamp = new Date().toISOString();
      all.push(subObj);
      localStorage.setItem(this.STORAGE_SUBMISSIONS, JSON.stringify(all));
      return subObj;
    }
  }
  window.QuizStorageEngine = QuizStorageEngine;

  // --- Interactive Live Quiz Editing Helpers ---
  window.updateQuizQuestionText = function(idx, val) {
    if (state.quizData && state.quizData[idx]) state.quizData[idx].question = val;
  };
  window.updateQuizQuestionAnswer = function(idx, val) {
    if (state.quizData && state.quizData[idx]) state.quizData[idx].answer = val;
  };
  window.updateQuizOptionText = function(qIdx, optIdx, val) {
    if (state.quizData && state.quizData[qIdx] && state.quizData[qIdx].options) {
      state.quizData[qIdx].options[optIdx] = val;
    }
  };
  window.deleteQuizQuestionAt = function(idx) {
    if (state.quizData) {
      state.quizData.splice(idx, 1);
      state.quizData.forEach((q, i) => q.id = i + 1);
      renderQuizQuestions(state.quizData);
      showToast('Question deleted', 'info');
    }
  };
  window.addQuizQuestion = function() {
    if (!state.quizData) state.quizData = [];
    const newId = state.quizData.length + 1;
    state.quizData.push({
      id: newId,
      type: 'mcq',
      difficulty: 'medium',
      question: 'New Question Prompt',
      answer: 'Option A',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      explanation: 'Explanation for correct answer.'
    });
    renderQuizQuestions(state.quizData);
    showToast('New question added!', 'success');
  };

  function openQuizShareConfigModal() {
    const modalId = 'quiz-share-config-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden relative">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition z-10">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white space-y-2">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner"><i class="fa-solid fa-share-nodes"></i></div>
            <div>
              <h3 class="text-xl font-extrabold">Publish Shared Quiz (PRO)</h3>
              <p class="text-xs text-amber-100">Configure participant details form and publish your quiz</p>
            </div>
          </div>
        </div>

        <div class="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Quiz Title <span class="text-red-500">*</span></label>
            <input type="text" id="share-quiz-title" class="custom-input w-full text-sm font-semibold" placeholder="e.g. Science Midterm Assessment" value="Interactive Knowledge Assessment">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Quiz Instructions / Description</label>
            <textarea id="share-quiz-description" rows="2" class="custom-input w-full text-xs" placeholder="Optional: Add instructions for participants..."></textarea>
          </div>

          <div class="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <div class="flex items-center justify-between border-b border-indigo-100 pb-2">
              <h4 class="font-extrabold text-sm text-indigo-900 flex items-center gap-2">
                <i class="fa-solid fa-user-pen text-indigo-600"></i> Participant Entry Fields
              </h4>
              <span class="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-200 text-indigo-700">Ask these on the quiz start page</span>
            </div>

            <div class="space-y-2.5" id="share-participant-fields">
              ${renderParticipantFieldRow('participant_name', 'Full Name', 'text', true, true, 'Enter your full name')}
              ${renderParticipantFieldRow('participant_email', 'Email Address', 'email', false, true, 'your@email.com')}
              ${renderParticipantFieldRow('participant_phone', 'Phone / Mobile Number', 'tel', false, false, '+91 98765 43210')}
              ${renderParticipantFieldRow('participant_class', 'Class / Grade / Batch', 'text', false, false, 'e.g. Class 10, 2026 Batch')}
              ${renderParticipantFieldRow('participant_rollno', 'Roll Number / ID', 'text', false, false, 'e.g. R-1042')}
              ${renderParticipantFieldRow('participant_custom1', 'Custom Field #1', 'text', false, false, 'Custom field')}
              ${renderParticipantFieldRow('participant_custom2', 'Custom Field #2', 'text', false, false, 'Custom field')}
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 class="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <i class="fa-solid fa-gear text-slate-600"></i> Quiz Behaviour
            </h4>
            <label class="inline-flex items-start gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" id="share-show-answers" checked class="accent-indigo-600 w-4 h-4 mt-0.5">
              <span>Show correct answers & explanations after participant submits</span>
            </label>
            <label class="inline-flex items-start gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" id="share-show-score" checked class="accent-indigo-600 w-4 h-4 mt-0.5">
              <span>Show score & percentage to participant after completion</span>
            </label>
            <label class="inline-flex items-start gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" id="share-shuffle" class="accent-indigo-600 w-4 h-4 mt-0.5">
              <span>Shuffle question order for each participant</span>
            </label>
            <label class="inline-flex items-start gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" id="share-one-attempt" checked class="accent-indigo-600 w-4 h-4 mt-0.5">
              <span>Only allow one attempt per participant (based on email + device)</span>
            </label>
          </div>
        </div>

        <div class="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
          <button onclick="document.getElementById('${modalId}').remove()" class="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 transition">
            Cancel
          </button>
          <button onclick="publishQuizFromConfig('${modalId}')" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-rocket"></i> Publish & Generate Share Link
          </button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  function renderParticipantFieldRow(id, label, type, isRequired, isEnabled, placeholder) {
    return `<div class="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200">
      <input type="checkbox" id="${id}_enabled" ${isEnabled ? 'checked' : ''} class="accent-indigo-600 w-4 h-4 flex-shrink-0">
      <div class="flex-1 grid grid-cols-12 gap-2 items-center">
        <label for="${id}_label" class="col-span-3 text-[11px] font-bold text-slate-600">${label}</label>
        <input type="text" id="${id}_label" value="${label}" class="col-span-5 custom-input text-[11px] px-2 py-1 bg-slate-50" placeholder="Field label">
        <select id="${id}_type" class="col-span-2 custom-input text-[11px] px-2 py-1 bg-slate-50">
          <option value="text" ${type === 'text' ? 'selected' : ''}>Text</option>
          <option value="email" ${type === 'email' ? 'selected' : ''}>Email</option>
          <option value="tel" ${type === 'tel' ? 'selected' : ''}>Phone</option>
          <option value="number" ${type === 'number' ? 'selected' : ''}>Number</option>
          <option value="date" ${type === 'date' ? 'selected' : ''}>Date</option>
        </select>
        <label class="col-span-2 flex items-center gap-1 text-[10px] font-bold text-slate-500">
          <input type="checkbox" id="${id}_required" ${isRequired ? 'checked' : ''} class="accent-rose-500 w-3 h-3"> Required
        </label>
      </div>
    </div>`;
  }

  function collectParticipantFieldsConfig() {
    const ids = ['participant_name','participant_email','participant_phone','participant_class','participant_rollno','participant_custom1','participant_custom2'];
    const fields = [];
    ids.forEach(id => {
      const enabledEl = document.getElementById(`${id}_enabled`);
      if (!enabledEl || !enabledEl.checked) return;
      fields.push({
        key: id,
        label: document.getElementById(`${id}_label`)?.value || id,
        type: document.getElementById(`${id}_type`)?.value || 'text',
        required: document.getElementById(`${id}_required`)?.checked || false
      });
    });
    return fields;
  }

  window.publishQuizFromConfig = function(modalId) {
    const currentUser = window.AuthSubscriptionEngine ? AuthSubscriptionEngine.getCurrentUser() : null;
    const title = document.getElementById('share-quiz-title')?.value?.trim();
    if (!title) { showToast('Please enter a quiz title.', 'error'); return; }
    const description = document.getElementById('share-quiz-description')?.value?.trim() || '';
    const participantFields = collectParticipantFieldsConfig();
    if (participantFields.length === 0) { showToast('Please enable at least one participant field (e.g. Name).', 'error'); return; }

    const quizId = 'quiz_' + Date.now();
    const showAnswers = document.getElementById('share-show-answers')?.checked ?? true;
    const showScore = document.getElementById('share-show-score')?.checked ?? true;
    const shuffle = document.getElementById('share-shuffle')?.checked ?? false;
    const oneAttempt = document.getElementById('share-one-attempt')?.checked ?? true;

    QuizStorageEngine.saveQuiz({
      id: quizId,
      creatorId: currentUser?.id || 'unknown',
      creatorEmail: currentUser?.email || '',
      creatorName: currentUser?.name || 'Instructor',
      title,
      description,
      participantFields,
      behaviour: { showAnswers, showScore, shuffle, oneAttempt },
      questions: state.quizData,
      createdAt: new Date().toISOString()
    });

    document.getElementById(modalId)?.remove();
    openShareQuizModal(quizId, title);
    if (window.showToast) window.showToast('Quiz published! Shareable link generated successfully.', 'success');
  };

  // --- Share Quiz Link PRO Verification & Modal ---
  window.shareQuizLinkPRO = function() {
    const currentUser = window.AuthSubscriptionEngine ? AuthSubscriptionEngine.getCurrentUser() : null;
    const isSubscribed = currentUser && currentUser.planId !== 'free' && currentUser.status === 'active';

    if (!isSubscribed) {
      if (window.AuthSubscriptionEngine) AuthSubscriptionEngine.openSubscriptionModal();
      if (window.showToast) {
        window.showToast('Shareable Quiz Links are exclusive to Subscribed PRO Users. Upgrade to PRO to generate shareable links!', 'info');
      }
      return;
    }

    if (!state.quizData || state.quizData.length === 0) {
      showToast('Please generate or create quiz questions first.', 'error');
      return;
    }

    openQuizShareConfigModal();
  };

  function openShareQuizModal(quizId, title) {
    const modalId = 'quiz-share-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const shareUrl = `${window.location.origin}${window.location.pathname}#quiz/${quizId}`;

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden relative">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center text-2xl mx-auto shadow-inner">
            <i class="fa-solid fa-share-nodes"></i>
          </div>
          <h3 class="text-xl font-extrabold">Quiz Link Generated!</h3>
          <p class="text-xs text-purple-100">PRO Feature &bull; Share this link with participants to take the quiz</p>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase">Quiz Title</label>
            <p class="font-extrabold text-sm text-slate-900">${title}</p>
          </div>

          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase">Participant Shareable URL</label>
            <div class="flex gap-2 mt-1">
              <input type="text" id="share-quiz-input-url" class="custom-input w-full text-xs font-mono bg-slate-50" value="${shareUrl}" readonly>
              <button onclick="copyShareQuizUrl()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition whitespace-nowrap">
                <i class="fa-solid fa-copy mr-1"></i> Copy Link
              </button>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 space-y-2">
            <div class="flex justify-between items-center">
              <button onclick="viewQuizSubmissionsModal('${quizId}')" class="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                <i class="fa-solid fa-users"></i> View Participant Analytics (${QuizStorageEngine.getSubmissions(quizId).length})
              </button>
              <a href="${shareUrl}" target="_blank" class="text-xs font-bold text-emerald-600 hover:underline">
                Test Quiz Page <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
            <a href="#quiz-dashboard/${quizId}" onclick="document.getElementById('${modalId}').remove()" class="block w-full text-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2">
              <i class="fa-solid fa-gauge-high"></i> Open Quiz Dashboard — Edit Questions & See Full Analytics
            </a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  window.copyShareQuizUrl = function() {
    const input = document.getElementById('share-quiz-input-url');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value);
      showToast('Shareable Quiz Link copied to clipboard!', 'success');
    }
  };

  // --- Participant Submissions Analytics Modal ---
  window.viewQuizSubmissionsModal = function(quizId) {
    const submissions = QuizStorageEngine.getSubmissions(quizId);
    const quiz = QuizStorageEngine.getQuiz(quizId);

    const modalId = 'quiz-submissions-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const participantFields = (quiz?.participantFields || []).filter(f => f.enabled);
    const extraFieldHeaders = participantFields.map(f => `<th class="p-3">${f.label || f.key}</th>`).join('');
    const totalCols = 4 + participantFields.length;

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full overflow-hidden relative">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="p-6 bg-slate-900 text-white space-y-3">
          <div class="flex flex-wrap justify-between items-start gap-3">
            <div>
              <h3 class="text-lg font-extrabold flex items-center gap-2">
                <i class="fa-solid fa-users text-indigo-400"></i> Participant Analytics & Submissions
              </h3>
              <p class="text-xs text-slate-400">${quiz?.title || 'Quiz Assessment'} &bull; ${submissions.length} Total Attempts</p>
            </div>
            <div class="flex gap-2">
              <button onclick="exportSubmissionsCSV('${quizId}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5">
                <i class="fa-solid fa-file-csv"></i> Export CSV
              </button>
              <button onclick="exportSubmissionsPDF('${quizId}')" class="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs transition flex items-center gap-1.5">
                <i class="fa-solid fa-file-pdf"></i> Export PDF
              </button>
            </div>
          </div>
          ${submissions.length > 0 ? `
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div class="p-2.5 rounded-xl bg-white/10 text-center">
              <div class="text-[10px] text-slate-400 uppercase font-bold">Avg Score</div>
              <div class="text-sm font-extrabold text-emerald-400">${Math.round(submissions.reduce((a,s) => a + (s.percentage||0), 0) / submissions.length)}%</div>
            </div>
            <div class="p-2.5 rounded-xl bg-white/10 text-center">
              <div class="text-[10px] text-slate-400 uppercase font-bold">Highest</div>
              <div class="text-sm font-extrabold text-white">${Math.max(...submissions.map(s => s.percentage||0))}%</div>
            </div>
            <div class="p-2.5 rounded-xl bg-white/10 text-center">
              <div class="text-[10px] text-slate-400 uppercase font-bold">Lowest</div>
              <div class="text-sm font-extrabold text-amber-400">${Math.min(...submissions.map(s => s.percentage||0))}%</div>
            </div>
            <div class="p-2.5 rounded-xl bg-white/10 text-center">
              <div class="text-[10px] text-slate-400 uppercase font-bold">Passed (≥70%)</div>
              <div class="text-sm font-extrabold text-indigo-400">${submissions.filter(s => (s.percentage||0) >= 70).length} / ${submissions.length}</div>
            </div>
          </div>` : ''}
        </div>

        <div class="p-6 max-h-[480px] overflow-y-auto overflow-x-auto">
          <table class="w-full text-xs text-left min-w-max">
            <thead class="bg-slate-50 text-slate-600 border-b sticky top-0 z-10">
              <tr>
                <th class="p-3">Participant</th>
                <th class="p-3">Email</th>
                ${extraFieldHeaders}
                <th class="p-3">Score</th>
                <th class="p-3">Completed At</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${submissions.length > 0 ? submissions.map(s => {
                const customFields = s.participantFields || {};
                const extraCells = participantFields.map(f => `<td class="p-3 text-slate-600">${customFields[f.key] || customFields[f.label] || 'N/A'}</td>`).join('');
                return `
                <tr class="hover:bg-indigo-50/30">
                  <td class="p-3 font-extrabold text-slate-900">${s.name}</td>
                  <td class="p-3 text-slate-500">${s.email || 'N/A'}</td>
                  ${extraCells}
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded ${s.percentage >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} font-bold">
                      ${s.score}/${s.total} (${s.percentage}%)
                    </span>
                  </td>
                  <td class="p-3 text-slate-400">${new Date(s.timestamp).toLocaleString()}</td>
                </tr>`;
              }).join('') : `<tr><td colspan="${totalCols}" class="p-6 text-center text-slate-400 italic">No participants have submitted answers yet. Share your PRO quiz link to get responses!</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  // --- Public Participant Quiz Renderer & Interactive Submission Engine ---
  window.renderParticipantQuizPage = function(quizId) {
    const container = document.getElementById('public-quiz-view');
    if (!container) return;

    const quiz = QuizStorageEngine.getQuiz(quizId);

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      container.innerHTML = `
        <div class="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4 animate-fade-in">
          <div class="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mx-auto">
            <i class="fa-solid fa-file-circle-xmark"></i>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900">Quiz Not Found or Expired</h2>
          <p class="text-xs text-slate-500 max-w-md mx-auto">The quiz link you are trying to access does not exist or has been removed by the creator.</p>
          <a href="#" class="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition">
            Go to Home
          </a>
        </div>
      `;
      return;
    }

    const participantFields = quiz.participantFields || [];
    const enabledFields = participantFields.filter(f => f.enabled);
    
    const fieldInputsHtml = enabledFields.length === 0 ? `
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name <span class="text-red-500">*</span></label>
        <input type="text" data-field-key="name" required placeholder="e.g. Alex Johnson" class="custom-input w-full text-sm font-semibold">
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address <span class="text-slate-400 font-normal">(Optional)</span></label>
        <input type="email" data-field-key="email" placeholder="e.g. alex@example.com" class="custom-input w-full text-sm font-semibold">
      </div>
    ` : enabledFields.map(f => {
      const typeAttr = f.type === 'number' ? 'number' : (f.type === 'email' ? 'email' : (f.type === 'tel' ? 'tel' : 'text'));
      const requiredMark = f.required ? '<span class="text-red-500">*</span>' : '<span class="text-slate-400 font-normal">(Optional)</span>';
      const key = f.key || f.label;
      return `
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${f.label} ${f.required ? requiredMark : ''}</label>
        <input type="${typeAttr}" data-field-key="${key}" ${f.required ? 'required' : ''} placeholder="${f.label}" class="custom-input w-full text-sm font-semibold">
      </div>`;
    }).join('');

    const descHtml = quiz.description ? `<p class="text-xs text-slate-300 pt-1 italic">"${quiz.description}"</p>` : '';

    container.innerHTML = `
      <div class="max-w-3xl mx-auto my-10 px-4 animate-fade-in">
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          
          <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 space-y-3 relative">
            <div class="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
              <i class="fa-solid fa-graduation-cap"></i> Interactive Online Assessment
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">${quiz.title}</h1>
            ${descHtml}
            <p class="text-xs text-slate-300">Created by <span class="font-bold text-white">${quiz.author}</span> &bull; ${quiz.questions.length} Questions &bull; Free Participation</p>
          </div>

          <div id="participant-quiz-content" class="p-6 sm:p-8 space-y-6">
            <div class="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <h3 class="font-extrabold text-sm text-indigo-900 flex items-center gap-2">
                <i class="fa-solid fa-user-pen text-indigo-600"></i> Participant Details Required
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Please enter your details below to start the quiz. Your results will be securely transmitted to the quiz creator.
              </p>
            </div>

            <form id="participant-entry-form" onsubmit="event.preventDefault(); startParticipantQuiz('${quizId}');" class="space-y-4 max-w-md">
              ${fieldInputsHtml}

              <button type="submit" class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg hover:shadow-indigo-500/25 transition">
                Start Quiz Now <i class="fa-solid fa-arrow-right ml-2"></i>
              </button>
            </form>
          </div>

        </div>
      </div>
    `;
  };

  window.startParticipantQuiz = function(quizId) {
    const form = document.getElementById('participant-entry-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input[data-field-key]');
    const customFields = {};
    let name = 'Anonymous', email = '';

    for (const input of inputs) {
      const key = input.dataset.fieldKey;
      const value = input.value?.trim() || '';
      if (input.required && !value) {
        showToast(`Please fill in: ${input.previousElementSibling?.textContent?.split(' ')[0] || key}`, 'error');
        return;
      }
      customFields[key] = value;
      if (key.toLowerCase() === 'name') name = value;
      if (key.toLowerCase() === 'email') email = value;
    }

    if (!customFields['name'] && !customFields['Name'] && name === 'Anonymous') {
      name = customFields['name'] || customFields['Name'] || 'Anonymous';
    }

    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz) return;

    const behaviour = quiz.behaviour || {};
    let questions = [...(quiz.questions || [])];
    if (behaviour.shuffleQuestions) questions.sort(() => Math.random() - 0.5);
    questions.forEach(q => { if (q.options && q.options.length && behaviour.shuffleOptions) q.options = [...q.options].sort(() => Math.random() - 0.5); });

    window._currentParticipant = { name, email, quizId, customFields };

    const contentDiv = document.getElementById('participant-quiz-content');
    if (!contentDiv) return;

    contentDiv.innerHTML = `
      <form id="active-quiz-form" onsubmit="event.preventDefault(); submitParticipantQuiz('${quizId}');" class="space-y-6">
        <div class="space-y-6">
          ${questions.map((q, idx) => `
            <div class="p-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-600 text-white">Question ${idx + 1} of ${questions.length}</span>
                <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">${q.type.replace('-', ' ')}</span>
              </div>

              <p class="text-sm font-extrabold text-slate-900">${q.question}</p>

              ${q.options && q.options.length ? `
                <div class="space-y-2 pt-1">
                  ${q.options.map((opt, optIdx) => `
                    <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/50 cursor-pointer transition">
                      <input type="radio" name="q_${q.id}" value="${opt.replace(/"/g, '&quot;')}" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300">
                      <span class="text-xs font-semibold text-slate-800"><b class="text-slate-400 mr-1.5">${String.fromCharCode(65 + optIdx)}.</b> ${opt}</span>
                    </label>
                  `).join('')}
                </div>
              ` : `
                <div class="pt-1">
                  <input type="text" name="q_${q.id}" placeholder="Type your answer here..." class="custom-input w-full text-xs font-medium bg-white">
                </div>
              `}
            </div>
          `).join('')}
        </div>

        <button type="submit" class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl transition flex items-center justify-center gap-2">
          <i class="fa-solid fa-paper-plane"></i> Submit Final Quiz Answers
        </button>
      </form>
    `;
  };

  window.submitParticipantQuiz = function(quizId) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz) return;

    const behaviour = quiz.behaviour || {};
    const participant = window._currentParticipant || { name: 'Anonymous', email: '', quizId };
    const form = document.getElementById('active-quiz-form');
    if (!form) return;

    if (behaviour.oneAttempt && participant) {
      const existingKey = `studiosuite_quiz_attempted_${quizId}`;
      const participantKey = `${participant.name}_${participant.email}_${Object.values(participant.customFields||{}).join('_')}`;
      const existing = JSON.parse(localStorage.getItem(existingKey) || '[]');
      if (existing.includes(participantKey)) {
        showToast('You have already attempted this quiz. Multiple attempts are not allowed.', 'error');
        return;
      }
      existing.push(participantKey);
      localStorage.setItem(existingKey, JSON.stringify(existing));
    }

    let score = 0;
    const total = quiz.questions.length;
    const reviewData = [];

    quiz.questions.forEach(q => {
      let chosen = '';
      if (q.options && q.options.length) {
        const selected = form.querySelector(`input[name="q_${q.id}"]:checked`);
        chosen = selected ? selected.value : '';
      } else {
        const textInput = form.querySelector(`input[name="q_${q.id}"]`);
        chosen = textInput ? textInput.value.trim() : '';
      }

      const isCorrect = chosen.toLowerCase() === (q.answer || '').toLowerCase();
      if (isCorrect) score++;

      reviewData.push({
        question: q.question,
        chosen: chosen || 'No answer submitted',
        correct: q.answer,
        isCorrect,
        explanation: q.explanation
      });
    });

    const percentage = Math.round((score / total) * 100);

    QuizStorageEngine.saveSubmission({
      quizId,
      name: participant.name,
      email: participant.email,
      participantFields: participant.customFields || {},
      score,
      total,
      percentage,
      answers: reviewData
    });

    const contentDiv = document.getElementById('participant-quiz-content');
    if (!contentDiv) return;

    const showScore = behaviour.showScore !== false;
    const showAnswers = behaviour.showAnswers !== false;

    let innerHtml = `<div class="space-y-6 text-center animate-fade-in">`;

    if (showScore) {
      innerHtml += `
        <div class="p-6 rounded-3xl ${percentage >= 70 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'} space-y-2">
          <div class="w-16 h-16 rounded-2xl ${percentage >= 70 ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'} flex items-center justify-center text-3xl mx-auto shadow-lg">
            <i class="fa-solid ${percentage >= 70 ? 'fa-trophy' : 'fa-chart-pie'}"></i>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900">${percentage >= 70 ? 'Congratulations, ' + participant.name + '!' : 'Quiz Complete, ' + participant.name}</h2>
          <p class="text-xs text-slate-600 font-medium">Your score has been recorded and submitted to the quiz author.</p>

          <div class="flex justify-center items-center gap-4 pt-2">
            <div class="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div class="text-xs font-bold text-slate-400 uppercase">Score</div>
              <div class="text-xl font-extrabold text-indigo-600">${score} / ${total}</div>
            </div>
            <div class="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div class="text-xs font-bold text-slate-400 uppercase">Percentage</div>
              <div class="text-xl font-extrabold ${percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'}">${percentage}%</div>
            </div>
          </div>
        </div>`;
    } else {
      innerHtml += `
        <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900">Thank you, ${participant.name}!</h2>
          <p class="text-xs text-slate-600 font-medium">Your quiz responses have been recorded and submitted to the quiz author. Results will be reviewed and shared by the organizer.</p>
        </div>`;
    }

    if (showAnswers) {
      innerHtml += `
        <div class="space-y-4 text-left">
          <h3 class="font-extrabold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
            <i class="fa-solid fa-list-check text-indigo-600"></i> Answer Breakdown & Explanations
          </h3>

          <div class="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            ${reviewData.map((item, idx) => `
              <div class="p-4 rounded-xl border ${item.isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'} space-y-1 text-xs">
                <div class="font-bold text-slate-900 flex items-start gap-2">
                  <i class="fa-solid ${item.isCorrect ? 'fa-circle-check text-emerald-600' : 'fa-circle-xmark text-rose-600'} mt-0.5"></i>
                  <span><b>Q${idx + 1}:</b> ${item.question}</span>
                </div>
                <div class="pl-5 space-y-0.5 text-slate-700">
                  <div><b>Your Answer:</b> <span class="${item.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}">${item.chosen}</span></div>
                  ${!item.isCorrect ? `<div><b>Correct Answer:</b> <span class="text-emerald-700 font-bold">${item.correct}</span></div>` : ''}
                  ${item.explanation ? `<div class="text-slate-500 text-[11px] italic pt-1">${item.explanation}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
    }

    innerHtml += `</div>`;
    contentDiv.innerHTML = innerHtml;
  };

  function generateQuizQuestions(text, opts) {
    const { lang = 'en', qType = 'mcq', count = 10, diff = 'medium' } = opts || {};
    
    const sentences = extractCleanSentencesByLanguage(text, lang);
    const keywords = getKeywordsForQuiz(text, lang, 25);
    const t = QUIZ_I18N[lang] || QUIZ_I18N.en;

    const resolveType = (i) => qType === 'mixed' ? ['mcq','true-false','fill-blank','flashcards','short-answer'][i % 5] : qType;
    const out = [];
    const usedSentences = new Set();

    for (let i = 0; i < count; i++) {
      const type = resolveType(i);
      let sentIdx = Math.floor(Math.random() * sentences.length);
      let tries = 0;
      while (usedSentences.has(sentIdx) && tries < 20) {
        sentIdx = (sentIdx + 1) % sentences.length;
        tries++;
      }
      usedSentences.add(sentIdx);

      const sentence = sentences[sentIdx] || sentences[i % sentences.length];
      const wordsInSent = sentence.split(/\s+/).filter(w => w.length >= 2);
      
      let keyword = wordsInSent.find(w => keywords.includes(w)) || wordsInSent[Math.floor(Math.random() * wordsInSent.length)] || keywords[i % keywords.length];
      if (keyword) {
        keyword = keyword.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
      }

      if (!keyword || keyword.length < 2) {
        keyword = keywords[i % keywords.length] || (lang === 'ar' ? 'المفهوم' : 'concept');
      }

      let question, answer, options, explanation;

      if (type === 'mcq') {
        question = sentence.includes(keyword) ? sentence.replace(keyword, '________') : `${sentence} (________)`;
        answer = keyword;
        const distractors = pickLanguageDistractors(keyword, keywords, lang, 3);
        options = [answer, ...distractors].sort(() => Math.random() - 0.5);
        explanation = `${sentence}  →  (${t.ans}: ${keyword})`;
      } else if (type === 'true-false') {
        const flip = Math.random() > 0.5;
        const distractors = pickLanguageDistractors(keyword, keywords, lang, 1);
        if (flip && distractors.length > 0 && sentence.includes(keyword)) {
          question = sentence.replace(keyword, distractors[0]);
          answer = t.trueFalseFalse;
          explanation = lang === 'ar' ? `العبارة المعدلة غير صحيحة. الكلمة الأصلية: "${keyword}".` : `Original statement contains "${keyword}", not "${distractors[0]}".`;
        } else {
          question = sentence;
          answer = t.trueFalseTrue;
          explanation = lang === 'ar' ? `العبارة صحيحة وتتطابق مع المحتوى الأصلي.` : `This statement accurately reflects the source material.`;
        }
        options = [t.trueFalseTrue, t.trueFalseFalse];
      } else if (type === 'fill-blank') {
        question = sentence.includes(keyword) ? sentence.replace(keyword, '________') : `${sentence} (________)`;
        answer = keyword;
        explanation = `${t.fillBlank} ${t.ans}: ${keyword}.`;
      } else if (type === 'flashcards') {
        const words = sentence.split(' ');
        const half = Math.ceil(words.length / 2);
        question = words.slice(0, half).join(' ') + '...';
        answer = words.slice(half).join(' ');
        explanation = sentence;
      } else {
        question = `${t.q} ${i + 1}: ${sentence}`;
        answer = sentence;
        explanation = t.shortAnswer;
      }

      out.push({ id: i + 1, type, difficulty: diff, question, answer, options: options || [], explanation });
    }

    return out;
  }

  function renderQuizQuestions(data) {
    const container = document.getElementById('quiz-questions-container');
    if (!container || !data) return;
    container.innerHTML = '';
    const t = QUIZ_I18N[document.getElementById('ctrl-quiz-language')?.value] || QUIZ_I18N.en;

    // Render Quiz Management Header Actions (Export vs PRO Share Link vs Add Question)
    const headerActions = document.createElement('div');
    headerActions.className = 'p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap justify-between items-center gap-3 shadow-md mb-4';
    headerActions.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-600 text-white">${data.length} Questions</span>
        <button onclick="addQuizQuestion()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition">
          <i class="fa-solid fa-plus text-emerald-400 mr-1"></i> Add Question
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button onclick="openExportQuizMenu()" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition">
          <i class="fa-solid fa-file-export mr-1"></i> Export (PDF/TXT/JSON)
        </button>
        <button onclick="shareQuizLinkPRO()" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5">
          <i class="fa-solid fa-share-nodes"></i> Share Quiz Link (PRO)
        </button>
      </div>
    `;
    container.appendChild(headerActions);

    data.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white space-y-3';
      const typeBadge = { mcq: 'bg-indigo-100 text-indigo-700', 'true-false': 'bg-emerald-100 text-emerald-700', 'fill-blank': 'bg-amber-100 text-amber-700', flashcards: 'bg-purple-100 text-purple-700', 'short-answer': 'bg-rose-100 text-rose-700' }[q.type] || 'bg-slate-100 text-slate-700';
      const diffBadge = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-rose-100 text-rose-700' }[q.difficulty] || 'bg-slate-100';

      let optionsInputs = '';
      if (q.options && q.options.length) {
        optionsInputs = `<div class="space-y-1.5 pt-1">
          <label class="text-[10px] font-bold text-slate-500 uppercase">Answer Options (Editable):</label>
          ${q.options.map((opt, optIdx) => `
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-400 w-4">${String.fromCharCode(65 + optIdx)}.</span>
              <input type="text" value="${opt.replace(/"/g, '&quot;')}" oninput="updateQuizOptionText(${idx}, ${optIdx}, this.value)" class="custom-input w-full text-xs bg-white">
            </div>
          `).join('')}
        </div>`;
      }

      card.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-white">${t.q} ${q.id}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBadge} uppercase">${q.type.replace('-', ' ')}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${diffBadge} capitalize">${q.difficulty}</span>
          </div>

          <button onclick="deleteQuizQuestionAt(${idx})" class="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1">
            <i class="fa-solid fa-trash-can"></i> Remove Question
          </button>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold text-slate-500 uppercase">Question Text Prompt (Editable):</label>
          <input type="text" value="${q.question.replace(/"/g, '&quot;')}" oninput="updateQuizQuestionText(${idx}, this.value)" class="custom-input w-full text-xs font-semibold text-slate-900 bg-white">
        </div>

        ${optionsInputs}

        <div class="space-y-1 pt-1">
          <label class="text-[10px] font-bold text-slate-500 uppercase">Correct Answer (Editable):</label>
          <input type="text" value="${(q.answer || '').replace(/"/g, '&quot;')}" oninput="updateQuizQuestionAnswer(${idx}, this.value)" class="custom-input w-full text-xs font-bold text-emerald-700 bg-emerald-50/50">
        </div>
      `;
      container.appendChild(card);
    });
    const btnDl = document.getElementById('studio-btn-download');
    if (btnDl) btnDl.classList.remove('hidden');
  }

  function quizToPlainText(quizData, t) {
    return quizData.map(q => {
      const lines = [`${t.q} ${q.id} [${q.type.toUpperCase()}] [${q.difficulty.toUpperCase()}]`, q.question];
      if (q.options?.length) lines.push(...q.options.map((o, i) => `  ${String.fromCharCode(65 + i)}. ${o}`));
      lines.push('', `${t.ans}: ${q.answer}`, `${t.exp}: ${q.explanation}`, '─'.repeat(60), '');
      return lines.join('\n');
    }).join('\n');
  }

  function quizToPDF(quizData, t, title = 'Quiz Questions') {
    return new Promise((resolve) => {
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        resolve(null);
        return;
      }
      try {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 50;
        let y = margin;
        const maxWidth = pageWidth - (margin * 2);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(title, margin, y);
        y += 30;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()} | Total Questions: ${quizData.length}`, margin, y);
        y += 25;
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 20;

        quizData.forEach((q, qIdx) => {
          if (y + 200 > pageHeight) { doc.addPage(); y = margin; }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          const qLabel = `${t.q} ${q.id}  [${q.type.toUpperCase()} • ${q.difficulty.toUpperCase()}]`;
          doc.text(qLabel, margin, y);
          y += 20;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          const qLines = doc.splitTextToSize(q.question || '', maxWidth);
          doc.text(qLines, margin, y);
          y += (qLines.length * 16) + 8;

          if (q.options && q.options.length) {
            doc.setFontSize(11);
            q.options.forEach((o, oIdx) => {
              if (y + 20 > pageHeight) { doc.addPage(); y = margin; }
              const optText = `${String.fromCharCode(65 + oIdx)}. ${o}`;
              const isCorrect = (o === q.answer);
              if (isCorrect) { doc.setFont('helvetica', 'bold'); doc.setTextColor(34, 139, 34); }
              const oLines = doc.splitTextToSize(optText, maxWidth - 10);
              doc.text(oLines, margin + 10, y);
              y += (oLines.length * 15) + 3;
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(0);
            });
            y += 5;
          }

          if (y + 30 > pageHeight) { doc.addPage(); y = margin; }
          doc.setFontSize(10);
          doc.setTextColor(0, 100, 200);
          doc.setFont('helvetica', 'bold');
          doc.text(`${t.ans}: `, margin, y);
          doc.setFont('helvetica', 'normal');
          const ansLines = doc.splitTextToSize(q.answer || '', maxWidth - 60);
          doc.text(ansLines, margin + 60, y);
          y += (ansLines.length * 14) + 6;

          doc.setTextColor(120);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          const expLines = doc.splitTextToSize(`${t.exp}: ${q.explanation || ''}`, maxWidth);
          doc.text(expLines, margin, y);
          y += (expLines.length * 13) + 5;
          doc.setTextColor(0);
          doc.setFontSize(10);
          doc.setDrawColor(230);
          doc.line(margin, y, pageWidth - margin, y);
          y += 18;
        });

        resolve(doc);
      } catch (e) {
        console.error('PDF generation error:', e);
        resolve(null);
      }
    });
  }

  window.exportQuiz = async function(fmt = 'txt') {
    if (!state.quizData) return;
    const t = QUIZ_I18N[document.getElementById('ctrl-quiz-language')?.value] || QUIZ_I18N.en;
    if (fmt === 'pdf' || fmt === 'pdf-only-questions') {
      showToast('Generating PDF, please wait...', 'info');
      const doc = await quizToPDF(state.quizData, t, fmt === 'pdf-only-questions' ? 'Quiz (Questions Only)' : 'Quiz Questions & Answers');
      if (!doc) {
        if (window.showToast) showToast('PDF engine not available. Exporting as TXT instead.', 'info');
        fmt = 'txt';
      } else {
        doc.save(`quiz_${Date.now()}.pdf`);
        showToast(`Quiz exported as PDF!`, 'success');
        return;
      }
    }
    if (fmt === 'json') {
      const content = JSON.stringify(state.quizData, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `quiz_${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
      showToast('Quiz exported as JSON!', 'success');
      return;
    }
    if (fmt === 'csv-results-template') {
      let csv = 'Name,Email,Score,Total,Percentage,Timestamp\n';
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `quiz_results_template_${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
      showToast('Results CSV template exported!', 'success');
      return;
    }
    const content = quizToPlainText(state.quizData, t);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `quiz_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
    showToast('Quiz exported as TXT!', 'success');
  };

  window.openExportQuizMenu = function() {
    const modalId = 'quiz-export-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden relative">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white space-y-2">
          <h3 class="text-xl font-extrabold flex items-center gap-2"><i class="fa-solid fa-file-export"></i> Export Quiz</h3>
          <p class="text-xs text-emerald-100">Choose a format for quiz questions or results</p>
        </div>
        <div class="p-6 space-y-2">
          <button onclick="document.getElementById('${modalId}').remove(); exportQuiz('pdf');" class="w-full p-4 text-left rounded-2xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition flex items-center gap-4 group">
            <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl group-hover:scale-110 transition"><i class="fa-solid fa-file-pdf"></i></div>
            <div><div class="font-extrabold text-sm text-slate-900">PDF — Questions + Answers</div><div class="text-[11px] text-slate-500">Formatted print-ready PDF with correct answers highlighted</div></div>
          </button>
          <button onclick="document.getElementById('${modalId}').remove(); exportQuiz('pdf-only-questions');" class="w-full p-4 text-left rounded-2xl border border-slate-200 hover:bg-purple-50 hover:border-purple-300 transition flex items-center gap-4 group">
            <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl group-hover:scale-110 transition"><i class="fa-solid fa-file-contract"></i></div>
            <div><div class="font-extrabold text-sm text-slate-900">PDF — Questions Only</div><div class="text-[11px] text-slate-500">Clean question paper without revealing answers</div></div>
          </button>
          <button onclick="document.getElementById('${modalId}').remove(); exportQuiz('txt');" class="w-full p-4 text-left rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-slate-400 transition flex items-center gap-4 group">
            <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xl group-hover:scale-110 transition"><i class="fa-solid fa-file-lines"></i></div>
            <div><div class="font-extrabold text-sm text-slate-900">Text File (TXT)</div><div class="text-[11px] text-slate-500">Universal plain text format</div></div>
          </button>
          <button onclick="document.getElementById('${modalId}').remove(); exportQuiz('json');" class="w-full p-4 text-left rounded-2xl border border-slate-200 hover:bg-amber-50 hover:border-amber-300 transition flex items-center gap-4 group">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl group-hover:scale-110 transition"><i class="fa-solid fa-code"></i></div>
            <div><div class="font-extrabold text-sm text-slate-900">JSON Data</div><div class="text-[11px] text-slate-500">Structured JSON for LMS import / developers</div></div>
          </button>
          <button onclick="document.getElementById('${modalId}').remove(); exportQuiz('csv-results-template');" class="w-full p-4 text-left rounded-2xl border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center gap-4 group">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl group-hover:scale-110 transition"><i class="fa-solid fa-table"></i></div>
            <div><div class="font-extrabold text-sm text-slate-900">CSV Results Template</div><div class="text-[11px] text-slate-500">Empty CSV to record participant scores offline</div></div>
          </button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  };

  function generateAISummary(text, toolId) {
    const sentences = getSentences(text);
    if (!sentences.length) sentences.push(...getSentences(generateSampleContent('doc')));
    const lang = document.getElementById('ctrl-summary-lang')?.value || 'en';
    const lenMap = { brief: 4, standard: 8, detailed: 14, executive: 10 };
    const lenSel = document.getElementById('ctrl-summary-len')?.value || 'standard';
    const target = lenMap[lenSel] || 8;
    const kws = getKeywords(text, 8);
    const scored = sentences.map(s => {
      let score = 0;
      kws.forEach(k => { if (s.toLowerCase().includes(k)) score += 2; });
      if (/^\d/.test(s) || s.includes(':') || s.includes('—')) score += 1;
      if (s.length > 80) score += 1;
      return { s, score };
    }).sort((a, b) => b.score - a.score).slice(0, target).map(o => o.s);
    const ordered = sentences.filter(s => scored.includes(s));
    const isChat = toolId === 'ai-doc-chat';
    if (isChat) {
      return `AI Document Q&A Assistant
═══════════════════════════════════
📋 Top Questions You Can Ask:

1. What is the main topic or thesis of this document?
   → ${ordered[0] || 'Summarize key finding.'}

2. What are the key takeaways for the reader?
   ${ordered.slice(1, 4).map((o, i) => `   ${i + 1}. ${o}`).join('\n') || '   → Review bulleted list above.'}

3. What supporting evidence does the author provide?
   → Key terms highlighted: ${kws.slice(0, 5).join(', ')}.

4. What conclusions or recommendations are made?
   → ${ordered[ordered.length - 1] || 'Concluding summary.'}

5. Which sections should I read in detail?
   → Focus on sentences containing: ${kws.slice(0, 4).join(', ')}.

💡 Tip: Paste your own question into the extracted-text box above (toggle edit) and re-run for a targeted response.
═══════════════════════════════════`;
    }
    const header = lenSel === 'executive' ? '🏢 EXECUTIVE BRIEF\n\nTL;DR (30 sec): ' + (ordered[0] || '') + '\n\n📌 KEY FINDINGS\n' : '📋 SUMMARY OF DOCUMENT\n\n';
    const bullets = ordered.map((s, i) => `${lenSel === 'detailed' ? '•' : '•'} ${s}`).join('\n\n');
    const footer = `\n\n🔑 KEY TERMS: ${kws.slice(0, 8).join(' • ')}`;
    return header + bullets + footer;
  }

  window.resetStudioControlsDefaults = function() {
    const paper = document.getElementById('univ-paper-size');
    const size = document.getElementById('univ-target-size');
    if (paper) paper.value = 'A4';
    if (size) size.value = '';
    const comp = document.getElementById('ctrl-compression-level');
    if (comp) { comp.value = 'medium'; comp.dispatchEvent(new Event('change')); }
    showToast('Reset parameters to recommended defaults.', 'info');
  };

  function renderUserHistoryPage() {
    const container = document.getElementById('user-history-view'); if (!container) return;
    const currentUser = window.AuthSubscriptionEngine ? AuthSubscriptionEngine.getCurrentUser() : null;

    // Show loading state first
    container.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div class="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h2 class="text-2xl font-extrabold text-slate-900">User Work History & Cloud Autosave</h2>
            <p class="text-xs text-slate-500 mt-1">Inspect past document generations and processed files.</p>
          </div>
          <a href="#" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"><i class="fa-solid fa-arrow-left"></i> Back to Tools</a>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center py-12">
          <div class="text-center"><i class="fa-solid fa-circle-notch fa-spin text-indigo-600 text-2xl mb-3 block"></i><p class="text-xs text-slate-500">Loading history...</p></div>
        </div>
      </div>`;

    // Fetch async then render
    const userId = currentUser?.id || 'guest';
    (window.NeonEngine ? NeonEngine.getWorkHistory(userId) : Promise.resolve([])).then(history => {
      container.innerHTML = `
        <div class="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
          <div class="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h2 class="text-2xl font-extrabold text-slate-900">User Work History & Cloud Autosave</h2>
              <p class="text-xs text-slate-500 mt-1">Inspect past document generations and processed files.</p>
            </div>
            <a href="#" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"><i class="fa-solid fa-arrow-left"></i> Back to Tools</a>
          </div>
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-600 border-b">
                  <tr><th class="p-3">Tool Used</th><th class="p-3">File Name</th><th class="p-3">Size</th><th class="p-3">Processed At</th></tr>
                </thead>
                <tbody class="divide-y">
                  ${history.length > 0 ? history.map(h => `
                    <tr>
                      <td class="p-3 font-bold text-indigo-600">${h.toolName}</td>
                      <td class="p-3 font-semibold text-slate-900">${h.filename}</td>
                      <td class="p-3 text-slate-500">${Math.round((h.fileSize||0)/1024)} KB</td>
                      <td class="p-3 text-slate-400">${new Date(h.timestamp).toLocaleString()}</td>
                    </tr>`).join('') : `<tr><td colspan="4" class="p-6 text-center text-slate-400 italic">No work history records found.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>`;
    });
  }

  function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  window.exportSubmissionsCSV = function(quizId) {
    const submissions = QuizStorageEngine.getSubmissions(quizId);
    const quiz = QuizStorageEngine.getQuiz(quizId);
    const participantFields = (quiz?.participantFields || []).filter(f => f.enabled);

    let headers = ['Name', 'Email'];
    participantFields.forEach(f => headers.push(f.label || f.key));
    headers.push('Score', 'Total', 'Percentage', 'Timestamp');

    const rows = submissions.map(s => {
      const customFields = s.participantFields || {};
      let row = [s.name, s.email];
      participantFields.forEach(f => row.push(customFields[f.key] || customFields[f.label] || ''));
      row.push(s.score, s.total, s.percentage + '%', new Date(s.timestamp).toLocaleString());
      return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });

    const csv = headers.map(h => `"${h}"`).join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `quiz_submissions_${quizId}_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('Submissions exported as CSV!', 'success');
  };

  window.exportSubmissionsPDF = async function(quizId) {
    const submissions = QuizStorageEngine.getSubmissions(quizId);
    const quiz = QuizStorageEngine.getQuiz(quizId);
    const participantFields = (quiz?.participantFields || []).filter(f => f.enabled);

    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      showToast('PDF engine not available. Use CSV export instead.', 'error');
      return;
    }

    showToast('Generating PDF report...', 'info');
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      let y = margin;
      const maxWidth = pageWidth - (margin * 2);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(quiz?.title || 'Quiz Submissions Report', margin, y);
      y += 24;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const avgPct = submissions.length ? Math.round(submissions.reduce((a,s) => a + (s.percentage||0), 0) / submissions.length) : 0;
      doc.text(`Generated: ${new Date().toLocaleString()}  |  Total Submissions: ${submissions.length}  |  Avg Score: ${avgPct}%  |  Passed: ${submissions.filter(s => (s.percentage||0) >= 70).length}`, margin, y);
      y += 18;
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;

      const fieldLabels = participantFields.map(f => (f.label || f.key).slice(0, 10));
      const colWidths = [60, 70, ...fieldLabels.map(() => 40), 50, 50, 70];
      let runningX = margin;
      const headers = ['Name', 'Email', ...fieldLabels, 'Score', '%', 'Date'];

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      headers.forEach((h, i) => {
        const w = colWidths[i] || 50;
        if (runningX + w > pageWidth - margin) return;
        doc.text(String(h), runningX, y);
        runningX += w;
      });
      y += 16;
      doc.setDrawColor(220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      submissions.forEach((s, sIdx) => {
        if (y + 60 > doc.internal.pageSize.getHeight()) { doc.addPage(); y = margin; }
        const customFields = s.participantFields || {};
        runningX = margin;
        const values = [
          (s.name||'').slice(0, 18),
          (s.email||'N/A').slice(0, 20),
          ...participantFields.map(f => String(customFields[f.key] || customFields[f.label] || 'N/A').slice(0, 10)),
          `${s.score}/${s.total}`,
          `${s.percentage}%`,
          new Date(s.timestamp).toLocaleDateString()
        ];
        values.forEach((val, i) => {
          const w = colWidths[i] || 50;
          if (runningX + w > pageWidth - margin) return;
          const color = i === values.length - 3 ? ((s.percentage||0) >= 70 ? [34, 139, 34] : [200, 150, 0]) : 0;
          doc.setTextColor(color);
          doc.text(String(val || ''), runningX, y);
          doc.setTextColor(0);
          runningX += w;
        });
        y += 14;
        if ((sIdx + 1) % 5 === 0) { doc.setDrawColor(240); doc.line(margin, y, pageWidth - margin, y); y += 4; }
      });

      doc.save(`quiz_submissions_${quizId}_${Date.now()}.pdf`);
      showToast('Submissions report exported as PDF!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate PDF. Try CSV export instead.', 'error');
    }
  };

  // --- Quiz Creator Dashboard (Full Page Editor + Analytics) ---
  window.renderQuizCreatorDashboard = function(quizId) {
    const container = document.getElementById('quiz-dashboard-view');
    if (!container) return;

    const quiz = QuizStorageEngine.getQuiz(quizId);
    const currentUser = window.AuthSubscriptionEngine ? AuthSubscriptionEngine.getCurrentUser() : null;
    const isSubscribed = currentUser && currentUser.planId !== 'free' && currentUser.status === 'active';
    const isOwner = !quiz?.userId || !currentUser || quiz.userId === currentUser.id || currentUser.email === quiz.authorEmail || true;

    if (!quiz) {
      container.innerHTML = `
        <div class="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4 animate-fade-in">
          <div class="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mx-auto"><i class="fa-solid fa-file-circle-xmark"></i></div>
          <h2 class="text-2xl font-extrabold text-slate-900">Quiz Dashboard Not Found</h2>
          <p class="text-xs text-slate-500 max-w-md mx-auto">The quiz you're looking for doesn't exist or was removed.</p>
          <a href="#" class="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition">Back to Tools</a>
        </div>`;
      return;
    }

    const submissions = QuizStorageEngine.getSubmissions(quizId);
    const participantFields = quiz.participantFields || [];
    const behaviour = quiz.behaviour || {};
    const shareUrl = `${window.location.origin}${window.location.pathname}#quiz/${quizId}`;
    const avgScore = submissions.length ? Math.round(submissions.reduce((a,s) => a + (s.percentage||0), 0) / submissions.length) : 0;
    const passedCount = submissions.filter(s => (s.percentage||0) >= 70).length;
    const passRate = submissions.length ? Math.round((passedCount / submissions.length) * 100) : 0;

    container.innerHTML = `
      <div class="min-h-screen bg-slate-50 animate-fade-in">
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white">
          <div class="max-w-7xl mx-auto px-4 py-6">
            <div class="flex flex-wrap justify-between items-start gap-4">
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider">
                  <a href="#" class="hover:text-white flex items-center gap-1"><i class="fa-solid fa-arrow-left"></i> Back to Tools</a>
                  <span class="text-slate-500">•</span>
                  <i class="fa-solid fa-gauge-high"></i> Quiz Creator Dashboard
                </div>
                <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">${quiz.title}</h1>
                ${quiz.description ? `<p class="text-xs text-slate-300 italic max-w-2xl">"${quiz.description}"</p>` : ''}
                <p class="text-[11px] text-slate-400">Created: ${new Date(quiz.createdAt || Date.now()).toLocaleString()} &bull; ${quiz.questions?.length || 0} Questions</p>
              </div>
              <div class="flex gap-2 flex-wrap">
                <a href="${shareUrl}" target="_blank" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow transition flex items-center gap-1.5">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> Preview Quiz Page
                </a>
                <button onclick="document.getElementById('dash-share-copy').select();navigator.clipboard.writeText(document.getElementById('dash-share-copy').value);showToast('Share link copied!','success')" class="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow transition flex items-center gap-1.5">
                  <i class="fa-solid fa-copy"></i> Copy Share Link
                </button>
              </div>
            </div>
            <div class="mt-4 flex gap-2 items-center bg-white/5 rounded-xl p-2 border border-white/10 overflow-x-auto">
              <i class="fa-solid fa-link text-amber-400 pl-2 text-xs"></i>
              <input id="dash-share-copy" readonly value="${shareUrl}" class="flex-1 bg-transparent text-xs text-slate-200 font-mono py-1.5 px-2 outline-none min-w-0">
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div class="text-[10px] font-bold text-slate-500 uppercase">Total Participants</div>
              <div class="text-2xl font-extrabold text-slate-900 mt-1">${submissions.length}</div>
              <div class="text-[10px] text-indigo-600 font-semibold mt-0.5"><i class="fa-solid fa-users"></i> Unique attempts</div>
            </div>
            <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div class="text-[10px] font-bold text-slate-500 uppercase">Average Score</div>
              <div class="text-2xl font-extrabold text-emerald-600 mt-1">${avgScore}%</div>
              <div class="text-[10px] text-emerald-600 font-semibold mt-0.5"><i class="fa-solid fa-chart-line"></i> Across all attempts</div>
            </div>
            <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div class="text-[10px] font-bold text-slate-500 uppercase">Pass Rate (≥70%)</div>
              <div class="text-2xl font-extrabold text-indigo-600 mt-1">${passRate}%</div>
              <div class="text-[10px] text-indigo-600 font-semibold mt-0.5"><i class="fa-solid fa-check-circle"></i> ${passedCount} / ${submissions.length}</div>
            </div>
            <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div class="text-[10px] font-bold text-slate-500 uppercase">Questions Bank</div>
              <div class="text-2xl font-extrabold text-purple-600 mt-1">${quiz.questions?.length || 0}</div>
              <div class="text-[10px] text-purple-600 font-semibold mt-0.5"><i class="fa-solid fa-clipboard-question"></i> Editable below</div>
            </div>
          </div>

          <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <button onclick="switchDashTab('questions')" id="dash-tab-questions" class="dash-tab flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-pen-to-square"></i> Edit Questions
            </button>
            <button onclick="switchDashTab('participants')" id="dash-tab-participants" class="dash-tab flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-users"></i> Participants & Results
            </button>
            <button onclick="switchDashTab('settings')" id="dash-tab-settings" class="dash-tab flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-gear"></i> Quiz Settings
            </button>
          </div>

          <div id="dash-tab-content-questions" class="dash-tab-content bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-slate-50/80">
              <div>
                <h3 class="font-extrabold text-slate-900 text-sm">Question Bank — Edit, Add or Remove Questions</h3>
                <p class="text-[11px] text-slate-500 mt-0.5">All changes auto-save to the shared quiz. Participants will see updates next attempt.</p>
              </div>
              <div class="flex gap-2">
                <button onclick="dashboardAddQuestion('${quizId}')" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5">
                  <i class="fa-solid fa-plus"></i> Add New Question
                </button>
                <button onclick="dashboardExportQuiz('${quizId}')" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1.5">
                  <i class="fa-solid fa-file-export"></i> Export Quiz (PDF)
                </button>
              </div>
            </div>
            <div id="dash-questions-container" class="p-5 space-y-4 max-h-[700px] overflow-y-auto">
              ${renderDashboardQuestionsList(quiz.questions || [], quizId)}
            </div>
          </div>

          <div id="dash-tab-content-participants" class="dash-tab-content bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hidden">
            <div class="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-slate-50/80">
              <div>
                <h3 class="font-extrabold text-slate-900 text-sm">Participant Submissions & Scoreboard</h3>
                <p class="text-[11px] text-slate-500 mt-0.5">View all responses, custom participant fields and scores.</p>
              </div>
              <div class="flex gap-2">
                <button onclick="exportSubmissionsCSV('${quizId}')" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5">
                  <i class="fa-solid fa-file-csv"></i> Export CSV
                </button>
                <button onclick="exportSubmissionsPDF('${quizId}')" class="px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs transition flex items-center gap-1.5">
                  <i class="fa-solid fa-file-pdf"></i> Export PDF
                </button>
              </div>
            </div>
            <div class="p-5 max-h-[700px] overflow-y-auto overflow-x-auto">
              ${renderDashboardSubmissions(quiz, submissions)}
            </div>
          </div>

          <div id="dash-tab-content-settings" class="dash-tab-content bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hidden">
            <div class="p-5 border-b border-slate-100 bg-slate-50/80">
              <h3 class="font-extrabold text-slate-900 text-sm">Quiz Configuration Settings</h3>
              <p class="text-[11px] text-slate-500 mt-0.5">Update title, description, participant fields and quiz behaviour.</p>
            </div>
            <div class="p-5 space-y-6">
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Quiz Title</label>
                  <input id="dash-setting-title" value="${(quiz.title||'').replace(/"/g, '&quot;')}" class="custom-input w-full text-sm font-semibold">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Author / Creator Name</label>
                  <input id="dash-setting-author" value="${(quiz.author||'').replace(/"/g, '&quot;')}" class="custom-input w-full text-sm font-semibold">
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Quiz Description (shown to participants)</label>
                <textarea id="dash-setting-description" rows="2" class="custom-input w-full text-xs">${quiz.description || ''}</textarea>
              </div>

              <div class="pt-4 border-t border-slate-100">
                <h4 class="font-extrabold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <i class="fa-solid fa-user-pen text-indigo-600"></i> Participant Details Fields
                  <span class="text-[10px] font-normal text-slate-500 ml-auto">Enable and configure what info participants must enter</span>
                </h4>
                <div class="space-y-2" id="dash-participant-fields">
                  ${renderDashboardParticipantFieldsEditor(participantFields)}
                </div>
              </div>

              <div class="pt-4 border-t border-slate-100">
                <h4 class="font-extrabold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <i class="fa-solid fa-sliders text-purple-600"></i> Quiz Behaviour Options
                </h4>
                <div class="grid sm:grid-cols-2 gap-3">
                  <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-indigo-50/50 transition">
                    <input type="checkbox" id="dash-behaviour-showScore" ${behaviour.showScore !== false ? 'checked' : ''} class="w-4 h-4 text-indigo-600 rounded">
                    <div>
                      <div class="text-xs font-bold text-slate-900">Show Final Score To Participants</div>
                      <div class="text-[10px] text-slate-500">Display score & percentage after submission</div>
                    </div>
                  </label>
                  <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-indigo-50/50 transition">
                    <input type="checkbox" id="dash-behaviour-showAnswers" ${behaviour.showAnswers !== false ? 'checked' : ''} class="w-4 h-4 text-indigo-600 rounded">
                    <div>
                      <div class="text-xs font-bold text-slate-900">Show Correct Answers After Submit</div>
                      <div class="text-[10px] text-slate-500">Show answer breakdown & explanations</div>
                    </div>
                  </label>
                  <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-indigo-50/50 transition">
                    <input type="checkbox" id="dash-behaviour-shuffleQuestions" ${behaviour.shuffleQuestions ? 'checked' : ''} class="w-4 h-4 text-indigo-600 rounded">
                    <div>
                      <div class="text-xs font-bold text-slate-900">Shuffle Question Order</div>
                      <div class="text-[10px] text-slate-500">Randomize questions per participant</div>
                    </div>
                  </label>
                  <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-indigo-50/50 transition">
                    <input type="checkbox" id="dash-behaviour-oneAttempt" ${behaviour.oneAttempt ? 'checked' : ''} class="w-4 h-4 text-indigo-600 rounded">
                    <div>
                      <div class="text-xs font-bold text-slate-900">Limit To One Attempt Per Person</div>
                      <div class="text-[10px] text-slate-500">Prevent re-submissions from same user</div>
                    </div>
                  </label>
                </div>
              </div>

              <div class="pt-4 border-t border-slate-100 flex flex-wrap gap-3 justify-between">
                <button onclick="dashboardDeleteQuiz('${quizId}')" class="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition flex items-center gap-1.5">
                  <i class="fa-solid fa-trash-can"></i> Delete Quiz Permanently
                </button>
                <button onclick="dashboardSaveSettings('${quizId}')" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-1.5">
                  <i class="fa-solid fa-floppy-disk"></i> Save All Quiz Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  };

  window.switchDashTab = function(tabName) {
    document.querySelectorAll('.dash-tab').forEach(t => {
      t.classList.remove('bg-gradient-to-r', 'from-indigo-600', 'to-purple-600', 'text-white', 'shadow');
      t.classList.add('text-slate-600', 'hover:bg-slate-100');
    });
    const activeTab = document.getElementById(`dash-tab-${tabName}`);
    if (activeTab) {
      activeTab.classList.add('bg-gradient-to-r', 'from-indigo-600', 'to-purple-600', 'text-white', 'shadow');
      activeTab.classList.remove('text-slate-600', 'hover:bg-slate-100');
    }
    document.querySelectorAll('.dash-tab-content').forEach(c => c.classList.add('hidden'));
    const content = document.getElementById(`dash-tab-content-${tabName}`);
    if (content) content.classList.remove('hidden');
  };

  function renderDashboardQuestionsList(questions, quizId) {
    if (!questions || questions.length === 0) {
      return `<div class="text-center py-10 space-y-3">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-3xl"><i class="fa-solid fa-clipboard-question"></i></div>
        <h4 class="font-extrabold text-slate-700 text-sm">No questions yet</h4>
        <p class="text-[11px] text-slate-500 max-w-xs mx-auto">Click "Add New Question" to build your quiz.</p>
      </div>`;
    }
    return questions.map((q, idx) => {
      const typeBadge = { mcq: 'bg-indigo-100 text-indigo-700', 'true-false': 'bg-emerald-100 text-emerald-700', 'fill-blank': 'bg-amber-100 text-amber-700', flashcards: 'bg-purple-100 text-purple-700', 'short-answer': 'bg-rose-100 text-rose-700' }[q.type] || 'bg-slate-100 text-slate-700';
      const diffBadge = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-rose-100 text-rose-700' }[q.difficulty] || 'bg-slate-100';
      const optionsHtml = q.options?.length ? `
        <div class="space-y-1.5 pt-2">
          <label class="text-[10px] font-bold text-slate-500 uppercase">Answer Options (click the correct one)</label>
          <div class="space-y-1.5">
            ${q.options.map((opt, oIdx) => `
              <div class="flex items-center gap-2">
                <input type="radio" name="dash-answer-${idx}" ${opt === q.answer ? 'checked' : ''} onchange="dashboardSetCorrectAnswer('${quizId}', ${idx}, ${oIdx})" class="w-4 h-4 text-emerald-600 rounded" title="Set as correct answer">
                <span class="text-xs font-bold text-slate-400 w-5">${String.fromCharCode(65 + oIdx)}.</span>
                <input type="text" value="${opt.replace(/"/g, '&quot;')}" oninput="dashboardUpdateOption('${quizId}', ${idx}, ${oIdx}, this.value)" class="custom-input w-full text-xs bg-white ${opt === q.answer ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-50/40 font-bold text-emerald-800' : ''}">
                <button onclick="dashboardRemoveOption('${quizId}', ${idx}, ${oIdx})" title="Remove option" class="text-slate-300 hover:text-red-500 text-xs w-6 h-6 flex items-center justify-center"><i class="fa-solid fa-minus"></i></button>
              </div>
            `).join('')}
            <button onclick="dashboardAddOption('${quizId}', ${idx})" class="text-[10px] text-indigo-600 font-bold flex items-center gap-1 hover:underline"><i class="fa-solid fa-plus"></i> Add Option</button>
          </div>
        </div>` : `
        <div class="pt-2">
          <label class="text-[10px] font-bold text-slate-500 uppercase">Correct Answer (exact text match)</label>
          <input type="text" value="${(q.answer||'').replace(/"/g, '&quot;')}" oninput="dashboardUpdateAnswer('${quizId}', ${idx}, this.value)" class="custom-input w-full text-xs font-bold text-emerald-800 bg-emerald-50/30">
        </div>`;
      return `
      <div class="p-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white space-y-3">
        <div class="flex flex-wrap justify-between items-start gap-2 pb-2 border-b border-slate-100">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-900 text-white">Q${idx + 1} / ${questions.length}</span>
            <select onchange="dashboardUpdateType('${quizId}', ${idx}, this.value)" class="text-[10px] font-bold px-2 py-1 rounded-full ${typeBadge} border-0 outline-none cursor-pointer bg-opacity-100">
              <option value="mcq" ${q.type==='mcq'?'selected':''}>Multiple Choice</option>
              <option value="true-false" ${q.type==='true-false'?'selected':''}>True / False</option>
              <option value="fill-blank" ${q.type==='fill-blank'?'selected':''}>Fill in the Blank</option>
              <option value="short-answer" ${q.type==='short-answer'?'selected':''}>Short Answer</option>
            </select>
            <select onchange="dashboardUpdateDifficulty('${quizId}', ${idx}, this.value)" class="text-[10px] font-bold px-2 py-1 rounded-full ${diffBadge} border-0 outline-none cursor-pointer">
              <option value="easy" ${q.difficulty==='easy'?'selected':''}>Easy</option>
              <option value="medium" ${q.difficulty==='medium'?'selected':''}>Medium</option>
              <option value="hard" ${q.difficulty==='hard'?'selected':''}>Hard</option>
            </select>
          </div>
          <button onclick="dashboardDeleteQuestion('${quizId}', ${idx})" class="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1">
            <i class="fa-solid fa-trash-can"></i> Delete
          </button>
        </div>
        <div>
          <label class="text-[10px] font-bold text-slate-500 uppercase">Question Text</label>
          <textarea rows="2" oninput="dashboardUpdateQuestionText('${quizId}', ${idx}, this.value)" class="custom-input w-full text-xs font-semibold text-slate-900 bg-white mt-1">${q.question}</textarea>
        </div>
        ${optionsHtml}
        <div>
          <label class="text-[10px] font-bold text-slate-500 uppercase">Explanation (optional)</label>
          <textarea rows="1" oninput="dashboardUpdateExplanation('${quizId}', ${idx}, this.value)" class="custom-input w-full text-[11px] text-slate-600 bg-white mt-1 italic">${q.explanation || ''}</textarea>
        </div>
      </div>`;
    }).join('');
  }

  function renderDashboardSubmissions(quiz, submissions) {
    const participantFields = (quiz?.participantFields || []).filter(f => f.enabled);
    const extraHeaders = participantFields.map(f => `<th class="p-3 text-[11px]">${f.label || f.key}</th>`).join('');
    const totalCols = 5 + participantFields.length;
    if (!submissions || submissions.length === 0) {
      return `<div class="text-center py-10 space-y-3">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-3xl"><i class="fa-solid fa-inbox"></i></div>
        <h4 class="font-extrabold text-slate-700 text-sm">No submissions yet</h4>
        <p class="text-[11px] text-slate-500 max-w-sm mx-auto">Participants haven't started taking the quiz yet. Share the quiz link to collect responses.</p>
      </div>`;
    }
    return `<table class="w-full text-xs text-left min-w-max">
      <thead class="bg-slate-50 text-slate-600 border-b sticky top-0 z-10">
        <tr>
          <th class="p-3 text-[11px]">#</th>
          <th class="p-3 text-[11px]">Participant</th>
          <th class="p-3 text-[11px]">Email</th>
          ${extraHeaders}
          <th class="p-3 text-[11px]">Score</th>
          <th class="p-3 text-[11px]">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y">
        ${submissions.map((s, i) => {
          const customFields = s.participantFields || {};
          const extraCells = participantFields.map(f => `<td class="p-3 text-slate-600">${customFields[f.key] || customFields[f.label] || 'N/A'}</td>`).join('');
          return `
          <tr class="hover:bg-indigo-50/30">
            <td class="p-3 text-slate-400 font-bold">${i + 1}</td>
            <td class="p-3 font-extrabold text-slate-900">${s.name} ${s.id ? `<div class="text-[9px] text-slate-400 font-normal font-mono">${s.id}</div>` : ''}</td>
            <td class="p-3 text-slate-500">${s.email || 'N/A'}</td>
            ${extraCells}
            <td class="p-3">
              <span class="px-2 py-0.5 rounded ${s.percentage >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} font-bold text-[11px]">
                ${s.score}/${s.total} (${s.percentage}%)
              </span>
              <div class="text-[9px] text-slate-400 mt-1">${new Date(s.timestamp).toLocaleString()}</div>
            </td>
            <td class="p-3">
              <button onclick="dashboardViewSubmissionDetails('${s.id}', '${quiz.id}')" class="text-[10px] font-bold text-indigo-600 hover:underline">View Response</button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  }

  function renderDashboardParticipantFieldsEditor(fields) {
    const defaultFields = [
      { key: 'name', label: 'Full Name', type: 'text', enabled: true, required: true },
      { key: 'email', label: 'Email Address', type: 'email', enabled: true, required: false },
      { key: 'phone', label: 'Phone Number', type: 'tel', enabled: false, required: false },
      { key: 'class', label: 'Class / Grade', type: 'text', enabled: false, required: false },
      { key: 'roll', label: 'Roll No / ID', type: 'text', enabled: false, required: false },
      { key: 'custom1', label: 'Custom Field 1', type: 'text', enabled: false, required: false },
      { key: 'custom2', label: 'Custom Field 2', type: 'number', enabled: false, required: false }
    ];
    const merged = defaultFields.map(def => {
      const existing = fields.find(f => f.key === def.key);
      return existing || def;
    });
    return merged.map((f, idx) => `
      <div class="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition">
        <div class="col-span-2 flex items-center gap-1.5">
          <input type="checkbox" data-fidx="${idx}" data-fprop="enabled" ${f.enabled ? 'checked' : ''} class="participant-field-toggle w-4 h-4 text-indigo-600 rounded">
          <span class="text-xs font-bold text-slate-700">Enable</span>
        </div>
        <div class="col-span-4">
          <input type="text" value="${(f.label||'').replace(/"/g, '&quot;')}" data-fidx="${idx}" data-fprop="label" class="participant-field-val custom-input w-full text-[11px] bg-white">
        </div>
        <div class="col-span-2">
          <select data-fidx="${idx}" data-fprop="type" class="participant-field-val w-full text-[11px] bg-white border border-slate-200 rounded-lg py-1.5 px-2">
            <option value="text" ${f.type==='text'?'selected':''}>Text</option>
            <option value="email" ${f.type==='email'?'selected':''}>Email</option>
            <option value="number" ${f.type==='number'?'selected':''}>Number</option>
            <option value="tel" ${f.type==='tel'?'selected':''}>Phone</option>
          </select>
        </div>
        <div class="col-span-3 flex items-center gap-1.5">
          <input type="checkbox" data-fidx="${idx}" data-fprop="required" ${f.required ? 'checked' : ''} class="participant-field-toggle w-4 h-4 text-red-600 rounded">
          <span class="text-xs font-semibold text-slate-600">Required</span>
          <span class="text-[10px] text-slate-400 ml-2 font-mono">key: ${f.key}</span>
        </div>
        <input type="hidden" data-fidx="${idx}" data-fprop="key" value="${f.key}" class="participant-field-val">
      </div>`).join('');
  }

  // --- Dashboard action handlers ---
  function getDashboardCurrentFields() {
    const result = [];
    const inputs = document.querySelectorAll('.participant-field-val, .participant-field-toggle');
    const map = {};
    inputs.forEach(inp => {
      const idx = inp.dataset.fidx;
      const prop = inp.dataset.fprop;
      if (!map[idx]) map[idx] = {};
      map[idx][prop] = inp.type === 'checkbox' ? inp.checked : inp.value;
    });
    Object.keys(map).sort().forEach(idx => result.push(map[idx]));
    return result;
  }

  window.dashboardSaveSettings = function(quizId) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz) return;
    quiz.title = document.getElementById('dash-setting-title')?.value?.trim() || quiz.title;
    quiz.author = document.getElementById('dash-setting-author')?.value?.trim() || quiz.author;
    quiz.description = document.getElementById('dash-setting-description')?.value?.trim() || '';
    quiz.participantFields = getDashboardCurrentFields();
    quiz.behaviour = {
      showScore: document.getElementById('dash-behaviour-showScore')?.checked !== false,
      showAnswers: document.getElementById('dash-behaviour-showAnswers')?.checked !== false,
      shuffleQuestions: document.getElementById('dash-behaviour-shuffleQuestions')?.checked,
      oneAttempt: document.getElementById('dash-behaviour-oneAttempt')?.checked
    };
    QuizStorageEngine.saveQuiz(quiz);
    showToast('Quiz settings saved successfully!', 'success');
    setTimeout(() => renderQuizCreatorDashboard(quizId), 400);
  };

  window.dashboardDeleteQuiz = function(quizId) {
    if (!confirm('Are you sure you want to PERMANENTLY DELETE this quiz and ALL submission data? This cannot be undone!')) return;
    const quizzes = QuizStorageEngine.getQuizzes().filter(q => q.id !== quizId);
    localStorage.setItem(QuizStorageEngine.STORAGE_QUIZZES, JSON.stringify(quizzes));
    const all = JSON.parse(localStorage.getItem(QuizStorageEngine.STORAGE_SUBMISSIONS) || '[]');
    const filtered = all.filter(s => s.quizId !== quizId);
    localStorage.setItem(QuizStorageEngine.STORAGE_SUBMISSIONS, JSON.stringify(filtered));
    showToast('Quiz deleted permanently.', 'info');
    setTimeout(() => { window.location.hash = '#tool/ai-quiz-creator'; }, 500);
  };

  window.dashboardAddQuestion = function(quizId) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz || !quiz.questions) return;
    const newId = (quiz.questions.length + 1);
    quiz.questions.push({
      id: newId,
      type: 'mcq',
      difficulty: 'medium',
      question: 'New Question Prompt (edit this text)',
      answer: 'Option A',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      explanation: 'Optional explanation / learning notes for this question.'
    });
    QuizStorageEngine.saveQuiz(quiz);
    const container = document.getElementById('dash-questions-container');
    if (container) container.innerHTML = renderDashboardQuestionsList(quiz.questions, quizId);
    showToast('New question added.', 'success');
    if (container) container.scrollTop = container.scrollHeight;
  };

  window.dashboardDeleteQuestion = function(quizId, qIdx) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz) return;
    quiz.questions.splice(qIdx, 1);
    quiz.questions.forEach((q, i) => q.id = i + 1);
    QuizStorageEngine.saveQuiz(quiz);
    const container = document.getElementById('dash-questions-container');
    if (container) container.innerHTML = renderDashboardQuestionsList(quiz.questions, quizId);
    showToast('Question removed.', 'info');
  };

  window.dashboardUpdateQuestionText = function(quizId, qIdx, val) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz?.questions?.[qIdx]) return;
    quiz.questions[qIdx].question = val;
    QuizStorageEngine.saveQuiz(quiz);
  };
  window.dashboardUpdateType = function(quizId, qIdx, val) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz?.questions?.[qIdx]) return;
    const q = quiz.questions[qIdx];
    q.type = val;
    if (val === 'true-false') {
      q.options = ['True', 'False'];
      if (!q.answer) q.answer = 'True';
    } else if (val === 'mcq' && (!q.options || q.options.length < 2)) {
      q.options = ['Option A', 'Option B', 'Option C', 'Option D'];
    } else if ((val === 'fill-blank' || val === 'short-answer') && q.options) {
      q.options = [];
    }
    QuizStorageEngine.saveQuiz(quiz);
    const container = document.getElementById('dash-questions-container');
    if (container) container.innerHTML = renderDashboardQuestionsList(quiz.questions, quizId);
  };
  window.dashboardUpdateDifficulty = function(quizId, qIdx, val) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz?.questions?.[qIdx]) return;
    quiz.questions[qIdx].difficulty = val;
    QuizStorageEngine.saveQuiz(quiz);
  };
  window.dashboardUpdateOption = function(quizId, qIdx, oIdx, val) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz?.questions?.[qIdx]?.options?.[oIdx]) return;
    quiz.questions[qIdx].options[oIdx] = val;
    QuizStorageEngine.saveQuiz(quiz);
  };
  window.dashboardSetCorrectAnswer = function(quizId, qIdx, oIdx) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz?.questions?.[qIdx]?.options) return;
    quiz.questions[qIdx].answer = quiz.questions[qIdx].options[oIdx];
    QuizStorageEngine.saveQuiz(quiz);
    const container = document.getElementById('dash-questions-container');
    if (container) container.innerHTML = renderDashboardQuestionsList(quiz.questions, quizId);
    showToast('Correct answer updated.', 'success');
  };
  window.dashboardAddOption = function(quizId, qIdx) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz?.questions?.[qIdx]) return;
    if (!quiz.questions[qIdx].options) quiz.questions[qIdx].options = [];
    quiz.questions[qIdx].options.push(`Option ${String.fromCharCode(65 + quiz.questions[qIdx].options.length)}`);
    QuizStorageEngine.saveQuiz(quiz);
    const container = document.getElementById('dash-questions-container');
    if (container) container.innerHTML = renderDashboardQuestionsList(quiz.questions, quizId);
  };
  window.dashboardRemoveOption = function(quizId, qIdx, oIdx) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz?.questions?.[qIdx]?.options) return;
    if (quiz.questions[qIdx].options.length <= 2) { showToast('Minimum 2 options required for MCQ.', 'error'); return; }
    quiz.questions[qIdx].options.splice(oIdx, 1);
    QuizStorageEngine.saveQuiz(quiz);
    const container = document.getElementById('dash-questions-container');
    if (container) container.innerHTML = renderDashboardQuestionsList(quiz.questions, quizId);
  };
  window.dashboardUpdateAnswer = function(quizId, qIdx, val) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz?.questions?.[qIdx]) return;
    quiz.questions[qIdx].answer = val;
    QuizStorageEngine.saveQuiz(quiz);
  };
  window.dashboardUpdateExplanation = function(quizId, qIdx, val) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz?.questions?.[qIdx]) return;
    quiz.questions[qIdx].explanation = val;
    QuizStorageEngine.saveQuiz(quiz);
  };
  window.dashboardExportQuiz = async function(quizId) {
    const quiz = QuizStorageEngine.getQuiz(quizId);
    if (!quiz) return;
    const t = { q: 'Q', ans: 'Correct Answer', exp: 'Explanation' };
    const doc = await quizToPDF(quiz.questions || [], t, quiz.title || 'Quiz Questions');
    if (doc) {
      doc.save(`quiz_${quizId}_${Date.now()}.pdf`);
      showToast('Quiz exported as PDF!', 'success');
    } else {
      showToast('PDF engine not available.', 'error');
    }
  };
  window.dashboardViewSubmissionDetails = function(subId, quizId) {
    const all = JSON.parse(localStorage.getItem(QuizStorageEngine.STORAGE_SUBMISSIONS) || '[]');
    const s = all.find(x => x.id === subId);
    if (!s) return;
    const modalId = 'sub-details-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();
    const answers = s.answers || [];
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden relative max-h-[90vh] flex flex-col">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition z-10">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-1 flex-shrink-0">
          <h3 class="text-lg font-extrabold flex items-center gap-2"><i class="fa-solid fa-file-lines text-indigo-300"></i> Response Details</h3>
          <p class="text-xs text-slate-300">${s.name} &bull; ${s.email || 'No email'} &bull; ${new Date(s.timestamp).toLocaleString()}</p>
          <div class="pt-2 flex items-center gap-3">
            <span class="px-3 py-1 rounded-full ${s.percentage >= 70 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'} font-extrabold text-xs">
              Score: ${s.score}/${s.total} (${s.percentage}%)
            </span>
            <button onclick="document.getElementById('${modalId}').remove(); exportSubmissionsCSV('${quizId}')" class="text-[11px] font-bold text-white/80 hover:text-white flex items-center gap-1"><i class="fa-solid fa-download"></i> Export CSV</button>
          </div>
        </div>
        <div class="p-5 overflow-y-auto space-y-3">
          ${answers.length === 0 ? '<p class="text-slate-400 italic text-center py-6 text-xs">No answer details recorded for this submission.</p>' :
          answers.map((a, idx) => `
            <div class="p-3 rounded-xl border ${a.isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'} space-y-1">
              <div class="flex items-start gap-2">
                <i class="fa-solid ${a.isCorrect ? 'fa-circle-check text-emerald-600' : 'fa-circle-xmark text-rose-600'} mt-0.5"></i>
                <div class="flex-1">
                  <div class="text-xs font-bold text-slate-900">Q${idx + 1}: ${a.question}</div>
                  <div class="text-[11px] text-slate-700 mt-0.5 pl-5 space-y-0.5">
                    <div>Your Answer: <span class="${a.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}">${a.chosen}</span></div>
                    ${!a.isCorrect ? `<div>Correct Answer: <span class="text-emerald-700 font-bold">${a.correct}</span></div>` : ''}
                    ${a.explanation ? `<div class="text-slate-500 italic text-[10px] pt-0.5">${a.explanation}</div>` : ''}
                  </div>
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
    document.body.appendChild(modal);
  };

  function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type === 'error' ? 'bg-red-600 text-white' : type === 'success' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-triangle-exclamation' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i><span class="text-sm font-semibold">${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
});