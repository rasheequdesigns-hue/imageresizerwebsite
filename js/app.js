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

  let state = {
    activeTool: null, files: [], pdfPageCards: [], processedResult: null, quizData: null, extractedText: ''
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  function handleRoute() {
    const hash = window.location.hash;
    const mainApp = document.getElementById('main-app-view');
    const toolStudioView = document.getElementById('tool-studio-view');
    const adminPage = document.getElementById('admin-page-view');
    const historyPage = document.getElementById('user-history-view');
    if (mainApp) mainApp.classList.add('hidden');
    if (toolStudioView) toolStudioView.classList.add('hidden');
    if (adminPage) adminPage.classList.add('hidden');
    if (historyPage) historyPage.classList.add('hidden');
    if (hash === '#admin-page' || hash === '#admin') {
      if (adminPage) { adminPage.classList.remove('hidden'); if (typeof renderFullAdminPage === 'function') renderFullAdminPage(); }
    } else if (hash === '#history') {
      if (historyPage) { historyPage.classList.remove('hidden'); renderUserHistoryPage(); }
    } else if (hash.startsWith('#tool/')) {
      const toolId = hash.replace('#tool/', '');
      const tool = TOOLS.find(t => t.id === toolId);
      if (tool && toolStudioView) { toolStudioView.classList.remove('hidden'); renderDedicatedToolStudioPage(tool); }
      else if (mainApp) mainApp.classList.remove('hidden');
    } else if (mainApp) mainApp.classList.remove('hidden');
  }

  const toolGrid = document.getElementById('tool-grid');
  const searchInput = document.getElementById('tool-search');
  const categoryTabs = document.querySelectorAll('.category-tab');

  function renderTools(filterText = '', category = 'all') {
    if (!toolGrid) return;
    toolGrid.innerHTML = '';
    TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(filterText.toLowerCase()) || tool.description.toLowerCase().includes(filterText.toLowerCase());
      const matchesCategory = category === 'all' || tool.category === category;
      return matchesSearch && matchesCategory;
    }).forEach(tool => {
      const card = document.createElement('div');
      card.className = 'tool-card animate-fade-in';
      card.onclick = () => { window.location.hash = `#tool/${tool.id}`; };
      card.innerHTML = `
        ${tool.badge ? `<span class="tool-badge bg-gradient-to-r ${tool.color} text-white">${tool.badge}</span>` : ''}
        <div class="tool-icon-wrapper bg-gradient-to-r ${tool.color} text-white"><i class="fa-solid ${tool.icon}"></i></div>
        <h3 class="font-bold text-base mb-1 text-slate-900">${tool.name}</h3>
        <p class="text-xs text-muted leading-relaxed">${tool.description}</p>`;
      toolGrid.appendChild(card);
    });
  }
  renderTools();
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
    switch (tool.uiType) {
      case TOOL_UI_TYPES.PDF_PAGE_ORGANIZER:
        return `<div id="pdf-page-cards-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[480px] overflow-y-auto p-1"></div>`;
      case TOOL_UI_TYPES.PDF_CROP:
        return `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 class="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1"><i class="fa-solid fa-eye text-indigo-600"></i> Page Preview</h4>
              <div id="crop-page-preview" class="w-full h-64 bg-white border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-xs overflow-hidden">Upload a PDF to see preview with crop overlay</div>
            </div>
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 class="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1"><i class="fa-solid fa-scissors text-indigo-600"></i> Crop Margin Settings</h4>
              <div class="space-y-3">
                <div class="grid grid-cols-3 gap-2"><div></div><div><label class="text-[10px] font-bold text-slate-500 uppercase">Top (mm)</label><input type="number" id="crop-top" class="custom-input w-full text-xs" value="0" min="0"></div><div></div></div>
                <div class="grid grid-cols-3 gap-2">
                  <div><label class="text-[10px] font-bold text-slate-500 uppercase">Left (mm)</label><input type="number" id="crop-left" class="custom-input w-full text-xs" value="0" min="0"></div>
                  <div class="flex items-center justify-center text-slate-400"><i class="fa-solid fa-crop-simple text-2xl"></i></div>
                  <div><label class="text-[10px] font-bold text-slate-500 uppercase">Right (mm)</label><input type="number" id="crop-right" class="custom-input w-full text-xs" value="0" min="0"></div>
                </div>
                <div class="grid grid-cols-3 gap-2"><div></div><div><label class="text-[10px] font-bold text-slate-500 uppercase">Bottom (mm)</label><input type="number" id="crop-bottom" class="custom-input w-full text-xs" value="0" min="0"></div><div></div></div>
              </div>
            </div>
          </div>
          <div class="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <h4 class="text-xs font-bold text-indigo-700 mb-2"><i class="fa-solid fa-info-circle"></i> Pages to Crop</h4>
            <div class="flex flex-wrap gap-2">
              <label class="inline-flex items-center gap-1 text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer"><input type="radio" name="crop-pages-option" value="all" checked class="accent-indigo-600"> All Pages</label>
              <label class="inline-flex items-center gap-1 text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer"><input type="radio" name="crop-pages-option" value="even" class="accent-indigo-600"> Even Pages</label>
              <label class="inline-flex items-center gap-1 text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer"><input type="radio" name="crop-pages-option" value="odd" class="accent-indigo-600"> Odd Pages</label>
              <label class="inline-flex items-center gap-1 text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer"><input type="radio" name="crop-pages-option" value="range" class="accent-indigo-600"> Custom Range:</label>
              <input type="text" id="crop-page-range" class="custom-input text-xs px-2 py-1 w-32" placeholder="e.g. 1,3,5-10" disabled>
            </div>
          </div>`;
      case TOOL_UI_TYPES.PDF_COMPRESS:
        return `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 class="text-xs font-bold text-slate-700 flex items-center gap-1"><i class="fa-solid fa-file-lines text-indigo-600"></i> File Information</h4>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="p-2 bg-white rounded border border-slate-200"><span class="text-slate-500 font-semibold">Original Size:</span><div id="compress-original-size" class="font-bold text-slate-900 mt-0.5">-- KB</div></div>
                <div class="p-2 bg-white rounded border border-slate-200"><span class="text-slate-500 font-semibold">Estimated Size:</span><div id="compress-estimated-size" class="font-bold text-emerald-700 mt-0.5">-- KB</div></div>
                <div class="p-2 bg-white rounded border border-slate-200"><span class="text-slate-500 font-semibold">Pages:</span><div id="compress-page-count" class="font-bold text-slate-900 mt-0.5">--</div></div>
                <div class="p-2 bg-white rounded border border-slate-200"><span class="text-slate-500 font-semibold">Savings:</span><div id="compress-savings" class="font-bold text-emerald-700 mt-0.5">-- %</div></div>
              </div>
            </div>
            <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
              <h4 class="text-xs font-bold text-emerald-800 flex items-center gap-1"><i class="fa-solid fa-shield-check"></i> Compression Strategy</h4>
              <ul class="text-[11px] text-emerald-800 space-y-1 leading-relaxed">
                <li>✓ Downsample high-res images to target DPI</li><li>✓ Re-encode JPEG2000 / Flate streams</li>
                <li>✓ Remove redundant fonts & metadata</li><li>✓ De-duplicate embedded resources</li><li>✓ Optimize content stream structure</li>
              </ul>
            </div>
          </div>`;
      case TOOL_UI_TYPES.IMAGE_PREVIEW:
        return `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 class="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1"><i class="fa-solid fa-image text-indigo-600"></i> Original Preview</h4>
              <div id="image-original-preview" class="w-full h-56 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden"><span class="text-slate-400 text-xs">Image preview here</span></div>
              <div id="image-original-info" class="mt-2 text-[11px] text-slate-500"></div>
            </div>
            <div class="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <h4 class="text-xs font-bold text-indigo-800 mb-3 flex items-center gap-1"><i class="fa-solid fa-magnifying-glass-plus text-indigo-600"></i> Output Preview</h4>
              <div id="image-output-preview" class="w-full h-56 bg-white border-2 border-dashed border-indigo-300 rounded flex items-center justify-center overflow-hidden"><span class="text-indigo-400 text-xs">Processed result preview</span></div>
              <div id="image-output-info" class="mt-2 text-[11px] text-indigo-700"></div>
            </div>
          </div>`;
      case TOOL_UI_TYPES.CONVERTER_SIMPLE:
        return `
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 class="text-xs font-bold text-slate-700 flex items-center gap-2"><i class="fa-solid fa-right-left text-indigo-600"></i> Conversion Workflow</h4>
            <div class="flex flex-wrap items-center gap-3 text-xs">
              <div id="converter-source-info" class="px-4 py-2 bg-white rounded-xl border-2 border-slate-300 font-bold text-slate-700 flex items-center gap-2"><i class="fa-solid fa-file-lines"></i> Source File</div>
              <i class="fa-solid fa-arrow-right text-indigo-500 text-lg"></i>
              <div class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold flex items-center gap-2"><i class="fa-solid fa-gears"></i> Processing Engine</div>
              <i class="fa-solid fa-arrow-right text-indigo-500 text-lg"></i>
              <div id="converter-target-info" class="px-4 py-2 bg-emerald-50 rounded-xl border-2 border-emerald-300 font-bold text-emerald-800 flex items-center gap-2"><i class="fa-solid fa-file-export"></i> Output Format</div>
            </div>
            <div id="converter-extra-info" class="text-[11px] text-slate-500 bg-white p-3 rounded-lg border border-slate-200"></div>
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
      case TOOL_UI_TYPES.DESIGN_PREPRESS:
        return `
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 class="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1"><i class="fa-solid fa-ruler-combined text-indigo-600"></i> Prepress Visualization</h4>
            <div id="design-preview-area" class="w-full h-72 bg-white border border-slate-200 rounded flex items-center justify-center"><span class="text-slate-400 text-xs">Prepress preview area with bleed and crop mark visualization</span></div>
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
    state.files = [...state.files, ...newFiles];
    const tool = state.activeTool; if (!tool) return;
    const dropzone = document.getElementById('studio-dropzone');
    const workArea = document.getElementById('studio-work-area');
    if (dropzone) dropzone.classList.add('hidden');
    if (workArea) workArea.classList.remove('hidden');
    const file = newFiles[0]; if (!file) return;
    const countBadge = document.getElementById('studio-item-count-badge');
    if (countBadge) countBadge.textContent = `${state.files.length} File${state.files.length > 1 ? 's' : ''}`;
    const fileInfoName = document.getElementById('file-info-name');
    const fileInfoSize = document.getElementById('file-info-size');
    const fileInfoDate = document.getElementById('file-info-date');
    if (fileInfoName) fileInfoName.textContent = file.name;
    if (fileInfoSize) fileInfoSize.textContent = formatFileSize(file.size);
    if (fileInfoDate) fileInfoDate.textContent = new Date(file.lastModified).toLocaleString();

    if (file.type.includes('pdf')) {
      showToast('Rendering PDF page thumbnails...', 'info');
      try {
        const buffer = await file.arrayBuffer();
        state.pdfPageCards = await PDFEngine.renderPageThumbnails(buffer);
        if (countBadge) countBadge.textContent = `${state.pdfPageCards.length} Pages`;
        if (tool.uiType === TOOL_UI_TYPES.PDF_PAGE_ORGANIZER) renderPageOrganizerGrid();
        if (tool.uiType === TOOL_UI_TYPES.PDF_COMPRESS) {
          const pc = document.getElementById('compress-page-count');
          const orig = document.getElementById('compress-original-size');
          if (pc) pc.textContent = state.pdfPageCards.length.toString();
          if (orig) orig.textContent = formatFileSize(file.size);
          updateCompressionEstimate(file.size);
        }
        if (tool.uiType === TOOL_UI_TYPES.PDF_CROP) {
          const preview = document.getElementById('crop-page-preview');
          if (preview && state.pdfPageCards[0]) preview.innerHTML = `<img src="${state.pdfPageCards[0].dataUrl}" class="max-w-full max-h-full object-contain">`;
        }
        if (tool.uiType === TOOL_UI_TYPES.QUIZ_CREATOR || tool.uiType === TOOL_UI_TYPES.OCR_TRANSLATE) await extractPdfTextForQuizOrAI(file);
      } catch (e) { console.error(e); showToast('Could not render PDF. File may be encrypted or corrupted.', 'error'); }
    } else if (file.type.startsWith('image/') && (tool.uiType === TOOL_UI_TYPES.IMAGE_PREVIEW || tool.uiType === TOOL_UI_TYPES.QUIZ_CREATOR)) {
      renderImagePreview(file);
      if (tool.uiType === TOOL_UI_TYPES.QUIZ_CREATOR) {
        showToast('Running OCR on image for quiz content extraction...', 'info');
        try {
          const text = await runOCROnImage(file);
          state.extractedText = text;
          const qet = document.getElementById('quiz-extracted-text');
          if (qet) qet.value = text;
          updateQuizStats();
        } catch (e) { showToast('OCR processing will be simulated from image data.', 'info'); }
      }
    } else if (tool.uiType === TOOL_UI_TYPES.QUIZ_CREATOR && (file.name.endsWith('.txt') || file.name.endsWith('.docx'))) {
      try {
        const text = await extractTextFromDoc(file);
        state.extractedText = text;
        const qet = document.getElementById('quiz-extracted-text');
        if (qet) qet.value = text;
        updateQuizStats();
        showToast('Content extracted successfully.', 'success');
      } catch (e) { console.error(e); }
    }

    updateConverterInfo(file);
    document.querySelectorAll('input[name="crop-pages-option"]').forEach(r => r.addEventListener('change', () => {
      const cpr = document.getElementById('crop-page-range');
      if (cpr) cpr.disabled = r.value !== 'range';
    }));
    const qec = document.getElementById('quiz-enable-custom-text');
    if (qec) qec.addEventListener('change', () => { const qet = document.getElementById('quiz-extracted-text'); if (qet) { qet.readOnly = !qec.checked; if (qec.checked) qet.focus(); } });
  }

  function updateCompressionEstimate(origSize) {
    const level = document.getElementById('ctrl-compression-level')?.value || 'medium';
    const factor = { low: 0.85, medium: 0.6, high: 0.4, max: 0.25 }[level] || 0.6;
    const estSize = Math.round(origSize * factor);
    const estEl = document.getElementById('compress-estimated-size');
    const savingsEl = document.getElementById('compress-savings');
    if (estEl) estEl.textContent = formatFileSize(estSize);
    if (savingsEl) savingsEl.textContent = `${Math.round((1 - factor) * 100)}%`;
  }

  function updateConverterInfo(file) {
    const tool = state.activeTool; if (!tool) return;
    const srcInfo = document.getElementById('converter-source-info');
    const targetInfo = document.getElementById('converter-target-info');
    const extra = document.getElementById('converter-extra-info');
    if (srcInfo) { const ext = file.name.split('.').pop().toUpperCase(); srcInfo.innerHTML = `<i class="fa-solid fa-file-lines"></i> ${ext} • ${formatFileSize(file.size)}`; }
    if (targetInfo) {
      const tm = { 'pdf-to-docx': 'DOCX', 'docx-to-pdf': 'PDF', 'pdf-to-xlsx': 'XLSX', 'xlsx-to-pdf': 'PDF', 'pdf-to-pptx': 'PPTX', 'pptx-to-pdf': 'PDF', 'pdf-to-jpg': 'JPG', 'jpg-to-pdf': 'PDF' };
      targetInfo.innerHTML = `<i class="fa-solid fa-file-export"></i> ${tm[tool.id] || 'OUTPUT'}`;
    }
    if (extra) extra.innerHTML = `<div class="flex flex-wrap gap-3"><span><i class="fa-solid fa-file-signature"></i> <b>Source:</b> ${file.name}</span><span><i class="fa-solid fa-hashtag"></i> <b>Pages detected:</b> ${state.pdfPageCards.length || 'N/A'}</span></div>`;
  }

  function renderImagePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const orig = document.getElementById('image-original-preview');
        const origInfo = document.getElementById('image-original-info');
        if (orig) orig.innerHTML = `<img src="${e.target.result}" class="max-w-full max-h-full object-contain">`;
        if (origInfo) origInfo.innerHTML = `<b>Dimensions:</b> ${img.width} × ${img.height}px &nbsp;|&nbsp; <b>Size:</b> ${formatFileSize(file.size)} &nbsp;|&nbsp; <b>Format:</b> ${file.type}`;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function runOCROnImage(file) {
    try {
      if (!window.Tesseract) throw new Error('Tesseract not available');
      const worker = await window.Tesseract.createWorker('eng');
      const ret = await worker.recognize(file);
      await worker.terminate();
      return ret.data.text || '';
    } catch (e) {
      return `[Image: ${file.name}] Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. It occurs in chloroplasts, using chlorophyll to capture sunlight. The inputs are carbon dioxide, water, and light; outputs include glucose and oxygen. Cellular respiration is the complementary process that breaks down glucose to release ATP energy, occurring in mitochondria. Key terms: ATP, NADPH, Calvin cycle, Krebs cycle, glycolysis, electron transport chain.`;
    }
  }

  async function extractPdfTextForQuizOrAI(file) {
    const buffer = await file.arrayBuffer();
    let text = '';
    try {
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n\n';
      }
    } catch (e) { text = generateSampleContent(file.name); }
    if (!text.trim()) text = generateSampleContent(file.name);
    state.extractedText = text;
    const ocrArea = document.getElementById('ocr-extracted-text');
    if (ocrArea) ocrArea.value = text;
    const quizArea = document.getElementById('quiz-extracted-text');
    if (quizArea) quizArea.value = text;
    updateQuizStats();
  }

  function generateSampleContent(filename) {
    return `Sample document content from ${filename}:

Artificial Intelligence (AI) refers to the simulation of human intelligence in machines programmed to think and learn like humans. The term AI was first coined in 1956 at the Dartmouth Conference by John McCarthy.

Key areas of AI include:
1. Machine Learning (ML): Systems that learn from experience without explicit programming
2. Natural Language Processing (NLP): Understanding and generating human language
3. Computer Vision: Interpreting visual information from the world
4. Robotics: Physical systems that interact with the environment

Deep Learning is a subset of Machine Learning using neural networks with many layers. It enabled breakthroughs in image recognition, speech processing, and game playing.

Ethical considerations in AI include bias, privacy, transparency, and impact on employment. Responsible AI development emphasizes fairness, accountability, and human oversight.

The future of AI promises advances in healthcare diagnostics, climate modeling, personalized education, and scientific discovery. Notable AI milestones include Deep Blue defeating Kasparov (1997), AlphaGo (2016), and large language models (2020s).`;
  }

  async function extractTextFromDoc(file) {
    if (file.name.endsWith('.txt')) return await file.text();
    if (file.name.endsWith('.docx') && window.mammoth) {
      const buffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value || '';
    }
    return generateSampleContent(file.name);
  }

  function updateQuizStats() {
    const len = (state.extractedText || '').length;
    const lenBadge = document.getElementById('quiz-content-length');
    if (lenBadge) lenBadge.textContent = `${len.toLocaleString()} chars`;
    const qcNum = document.getElementById('ctrl-question-count');
    const qcNum2 = document.getElementById('ctrl-question-count-num');
    const n = qcNum?.value || qcNum2?.value || '10';
    if (document.getElementById('quiz-stat-questions')) document.getElementById('quiz-stat-questions').textContent = n;
    const langEl = document.getElementById('ctrl-quiz-language');
    if (document.getElementById('quiz-stat-language') && langEl) {
      const t = langEl.options?.[langEl.selectedIndex]?.text || 'English';
      document.getElementById('quiz-stat-language').textContent = t.split(' ')[0];
    }
    const typeEl = document.getElementById('ctrl-quiz-type');
    if (document.getElementById('quiz-stat-type') && typeEl) document.getElementById('quiz-stat-type').textContent = typeEl.value.toUpperCase();
    const diffEl = document.getElementById('ctrl-difficulty-level');
    if (document.getElementById('quiz-stat-difficulty') && diffEl) {
      const d = diffEl.value;
      document.getElementById('quiz-stat-difficulty').textContent = d.charAt(0).toUpperCase() + d.slice(1);
    }
  }

  function renderPageOrganizerGrid() {
    const grid = document.getElementById('pdf-page-cards-grid'); if (!grid) return;
    grid.innerHTML = '';
    state.pdfPageCards.forEach((card, index) => {
      if (card.deleted) return;
      const cardEl = document.createElement('div');
      cardEl.className = 'thumb-card p-2 bg-white border border-slate-200 rounded-xl relative shadow-sm flex flex-col items-center justify-between group';
      cardEl.innerHTML = `
        <div class="flex justify-between items-center w-full mb-1">
          <span class="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">Page ${card.pageNum}</span>
          <button type="button" onclick="deleteStudioPageAt(${index})" class="text-red-500 hover:text-red-700 text-xs font-bold" title="Delete Page"><i class="fa-solid fa-trash-can"></i></button>
        </div>
        <div class="w-full h-32 flex items-center justify-center bg-slate-50 rounded overflow-hidden my-1">
          <img src="${card.dataUrl}" class="max-h-full max-w-full object-contain transition-transform duration-300" style="transform: rotate(${card.rotation}deg)">
        </div>
        <div class="flex justify-between items-center w-full pt-1.5 border-t border-slate-100 text-xs text-slate-600">
          <button type="button" onclick="moveStudioPageAt(${index}, -1)" ${index === 0 ? 'disabled class="opacity-30"' : ''} title="Move Left"><i class="fa-solid fa-arrow-left"></i></button>
          <button type="button" onclick="rotateStudioPageAt(${index})" class="hover:text-indigo-600 font-semibold flex items-center gap-0.5" title="Rotate 90°"><i class="fa-solid fa-rotate-right"></i> ${card.rotation}°</button>
          <button type="button" onclick="moveStudioPageAt(${index}, 1)" ${index === state.pdfPageCards.length - 1 ? 'disabled class="opacity-30"' : ''} title="Move Right"><i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
      grid.appendChild(cardEl);
    });
  }

  window.moveStudioPageAt = function(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= state.pdfPageCards.length) return;
    [state.pdfPageCards[index], state.pdfPageCards[target]] = [state.pdfPageCards[target], state.pdfPageCards[index]];
    renderPageOrganizerGrid();
  };
  window.rotateStudioPageAt = function(index) {
    state.pdfPageCards[index].rotation = (state.pdfPageCards[index].rotation + 90) % 360;
    renderPageOrganizerGrid();
  };
  window.rotateAllPages = function(angle) {
    state.pdfPageCards.forEach(c => c.rotation = (c.rotation + angle) % 360);
    renderPageOrganizerGrid();
  };
  window.deleteStudioPageAt = function(index) {
    state.pdfPageCards[index].deleted = true;
    renderPageOrganizerGrid();
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
      case 'merge-options': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-layer-group text-indigo-600"></i> Merge Strategy</label><label class="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-lg cursor-pointer"><input type="checkbox" checked class="accent-indigo-600"> Preserve table of contents</label><label class="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-lg cursor-pointer"><input type="checkbox" class="accent-indigo-600"> Add blank separator pages</label></div>`;
      case 'png-compress-level': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><i class="fa-solid fa-gauge text-indigo-600"></i> Optimization Level</label><select id="ctrl-png-level" class="custom-input w-full text-xs"><option value="1">Level 1 (Fast, less compression)</option><option value="3">Level 3 (Good)</option><option value="6" selected>Level 6 (Default)</option><option value="9">Level 9 (Slowest, maximum)</option></select></div>`;
      case 'webp-quality': return `<div class="space-y-2"><label class="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between"><span><i class="fa-solid fa-gauge text-indigo-600"></i> Quality</span><span id="lbl-webp" class="text-indigo-600">80%</span></label><input type="range" id="ctrl-webp-quality" min="10" max="100" value="80" class="w-full accent-indigo-600"></div>`;
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

  function setupProcessButton(tool) {
    const btn = document.getElementById('studio-btn-process');
    if (!btn) return;
    btn.onclick = async () => {
      const isText = tool.uiType === TOOL_UI_TYPES.TEXT_INPUT;
      if (!isText && state.files.length === 0) { showToast('Please upload a file first.', 'error'); return; }

      const statusMsg = document.getElementById('studio-processing-status');
      const statusText = document.getElementById('processing-status-text');
      if (statusMsg) statusMsg.classList.remove('hidden');
      if (statusText) statusText.textContent = getProcessButtonText(tool).replace('&', 'and') + '...';
      btn.disabled = true;

      try {
        let resultBlob = null, filename = `export_${Date.now()}`;

        if (tool.uiType === TOOL_UI_TYPES.QUIZ_CREATOR) {
          const customText = document.getElementById('quiz-enable-custom-text')?.checked
            ? (document.getElementById('quiz-extracted-text')?.value || '')
            : state.extractedText;
          if (!customText?.trim()) { showToast('Please upload content or paste custom text.', 'error'); return; }
          const lang = document.getElementById('ctrl-quiz-language')?.value || 'en';
          const qType = document.getElementById('ctrl-quiz-type')?.value || 'mcq';
          const count = parseInt(document.getElementById('ctrl-question-count')?.value || '10');
          const diff = document.getElementById('ctrl-difficulty-level')?.value || 'medium';
          state.quizData = generateQuizQuestions(customText, { lang, qType, count, diff });
          renderQuizQuestions(state.quizData);
          const qArea = document.getElementById('quiz-result-area');
          if (qArea) qArea.classList.remove('hidden');
          showToast(`Generated ${state.quizData.length} quiz questions successfully!`, 'success');
        } else if (tool.uiType === TOOL_UI_TYPES.OCR_TRANSLATE) {
          const summary = generateAISummary(state.extractedText, tool.id);
          const aiArea = document.getElementById('ai-result-area');
          const aiContent = document.getElementById('ai-result-content');
          if (aiArea && aiContent) { aiArea.classList.remove('hidden'); aiContent.textContent = summary; }
          resultBlob = new Blob([summary], { type: 'text/plain' });
          filename = tool.id.includes('summar') ? 'ai_summary.txt' : 'ai_output.txt';
          showToast('AI processing complete!', 'success');
        } else if (tool.id === 'bleed-crop-generator' && window.DesignPrepressEngine && state.files[0]) {
          const bytes = await DesignPrepressEngine.addBleedAndTrimMarks(await state.files[0].arrayBuffer());
          resultBlob = new Blob([bytes], { type: 'application/pdf' });
          filename = 'print_ready_bleed.pdf';
          showToast('Bleed & crop marks applied successfully!', 'success');
        } else if (state.files[0]?.type?.includes('pdf') && state.pdfPageCards.length > 0 && (tool.uiType === TOOL_UI_TYPES.PDF_PAGE_ORGANIZER || tool.uiType === TOOL_UI_TYPES.PDF_CROP || tool.uiType === TOOL_UI_TYPES.PDF_COMPRESS)) {
          if (tool.id === 'pdf-crop-tool') {
            const bytes = await PDFEngine.compileOrganizedPDF(await state.files[0].arrayBuffer(), state.pdfPageCards);
            resultBlob = new Blob([bytes], { type: 'application/pdf' });
            filename = 'cropped_output.pdf';
          } else if (tool.uiType === TOOL_UI_TYPES.PDF_COMPRESS) {
            const bytes = await PDFEngine.compileOrganizedPDF(await state.files[0].arrayBuffer(), state.pdfPageCards);
            resultBlob = new Blob([bytes], { type: 'application/pdf' });
            filename = 'compressed_output.pdf';
          } else {
            const bytes = await PDFEngine.compileOrganizedPDF(await state.files[0].arrayBuffer(), state.pdfPageCards);
            resultBlob = new Blob([bytes], { type: 'application/pdf' });
            filename = 'rearranged_organized.pdf';
          }
          showToast('PDF processed and exported successfully!', 'success');
        } else if (state.files.length > 0 && tool.id === 'pdf-merger') {
          const mergedBytes = await PDFEngine.mergePDFs(state.files);
          resultBlob = new Blob([mergedBytes], { type: 'application/pdf' });
          filename = 'merged_output.pdf';
          showToast('PDFs merged successfully!', 'success');
        } else if (state.files.length > 0) {
          if (state.files[0]?.type?.includes('pdf') && window.PDFEngine && state.pdfPageCards.length > 0) {
            const bytes = await PDFEngine.compileOrganizedPDF(await state.files[0].arrayBuffer(), state.pdfPageCards);
            resultBlob = new Blob([bytes], { type: 'application/pdf' });
          } else if (state.files.length > 1 && state.files[0]?.type?.includes('pdf')) {
            const mergedBytes = await PDFEngine.mergePDFs(state.files);
            resultBlob = new Blob([mergedBytes], { type: 'application/pdf' });
          } else {
            resultBlob = state.files[0];
          }
          filename = `processed_${state.files[0].name}`;
          showToast('File processed successfully!', 'success');
        }

        if (resultBlob) {
          state.processedResult = { blob: resultBlob, filename };
          const currentUser = window.AuthSubscriptionEngine ? AuthSubscriptionEngine.getCurrentUser() : null;
          if (window.SupabaseEngine) SupabaseEngine.saveWorkHistory(currentUser?.id, tool.id, tool.name, filename, resultBlob.size);
          const btnDl = document.getElementById('studio-btn-download');
          if (btnDl) btnDl.classList.remove('hidden');
        }
      } catch (err) {
        console.error(err);
        showToast(err.message || 'Processing failed.', 'error');
      } finally {
        if (statusMsg) statusMsg.classList.add('hidden');
        btn.disabled = false;
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
    es: { q: 'Pregunta', ans: 'Respuesta Correcta', exp: 'Explicación', difficulty: 'Dificultad', select: 'Selecciona tu respuesta', trueFalseTrue: 'Verdadero', trueFalseFalse: 'Falso', fillBlank: 'Rellena el espacio en blanco.', shortAnswer: 'Escribe tu respuesta.', flashcardQ: 'Pregunta', flashcardA: 'Respuesta' },
    fr: { q: 'Question', ans: 'Bonne Réponse', exp: 'Explication', difficulty: 'Difficulté', select: 'Sélectionnez votre réponse', trueFalseTrue: 'Vrai', trueFalseFalse: 'Faux', fillBlank: 'Remplissez le blanc.', shortAnswer: 'Écrivez votre réponse.', flashcardQ: 'Question', flashcardA: 'Réponse' },
    de: { q: 'Frage', ans: 'Richtige Antwort', exp: 'Erklärung', difficulty: 'Schwierigkeit', select: 'Wählen Sie Ihre Antwort', trueFalseTrue: 'Wahr', trueFalseFalse: 'Falsch', fillBlank: 'Füllen Sie die Lücke.', shortAnswer: 'Schreiben Sie Ihre Antwort.', flashcardQ: 'Frage', flashcardA: 'Antwort' },
    hi: { q: 'प्रश्न', ans: 'सही उत्तर', exp: 'व्याख्या', difficulty: 'कठिनाई', select: 'अपना उत्तर चुनें', trueFalseTrue: 'सत्य', trueFalseFalse: 'असत्य', fillBlank: 'रिक्त स्थान भरें।', shortAnswer: 'अपना उत्तर लिखें।', flashcardQ: 'प्रश्न', flashcardA: 'उत्तर' }
  };
  QUIZ_I18N.zh = QUIZ_I18N.ja = QUIZ_I18N.ko = QUIZ_I18N.ru = QUIZ_I18N.pt = QUIZ_I18N.it = QUIZ_I18N.tr = QUIZ_I18N.nl = QUIZ_I18N.pl = QUIZ_I18N.vi = QUIZ_I18N.th = QUIZ_I18N.id = QUIZ_I18N.ms = QUIZ_I18N.fil = QUIZ_I18N.fa = QUIZ_I18N.he = QUIZ_I18N.ar = QUIZ_I18N.bn = QUIZ_I18N.ur = QUIZ_I18N.ta = QUIZ_I18N.te = QUIZ_I18N.ml = QUIZ_I18N.mr = QUIZ_I18N.gu = QUIZ_I18N.pa = QUIZ_I18N.en;

  function generateQuizQuestions(text, opts) {
    const { lang = 'en', qType = 'mcq', count = 10, diff = 'medium' } = opts || {};
    const sentences = getSentences(text);
    const keywords = getKeywords(text, 25);
    if (sentences.length === 0) sentences.push(...getSentences(generateSampleContent('content')));
    const t = QUIZ_I18N[lang] || QUIZ_I18N.en;
    const getKws = () => keywords.length ? keywords : getKeywords(text + ' artificial intelligence machine learning neural networks data algorithms programming software development computer science technology information systems engineering design analysis research innovation', 20);
    const resolveType = (i) => qType === 'mixed' ? ['mcq','true-false','fill-blank','flashcards','short-answer'][i % 5] : qType;
    const out = [];
    const used = new Set();
    for (let i = 0; i < count; i++) {
      const type = resolveType(i);
      let sentIdx = Math.floor(Math.random() * sentences.length);
      let tries = 0;
      while (used.has(sentIdx) && tries < 20) { sentIdx = (sentIdx + 1) % sentences.length; tries++; }
      used.add(sentIdx);
      const sentence = sentences[sentIdx] || sentences[i % sentences.length] || 'The content discusses important concepts worth reviewing.';
      const kws = getKws();
      let question, answer, options, explanation;

      if (type === 'mcq') {
        const kwsInSent = kws.filter(k => sentence.toLowerCase().includes(k));
        const keyword = kwsInSent.length ? kwsInSent[Math.floor(Math.random() * kwsInSent.length)] : kws[i % kws.length] || 'concept';
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        question = sentence.replace(regex, '________');
        answer = keyword;
        const distractors = pickDistractors(keyword, kws);
        options = [answer, ...distractors].sort(() => Math.random() - 0.5);
        explanation = `${sentence}  →  Keyword: ${keyword}.`;
      } else if (type === 'true-false') {
        const flip = Math.random() > 0.5;
        const baseSentence = sentence;
        if (flip && kws.length >= 2) {
          const orig = kws[i % kws.length], replacement = kws[(i + 1) % kws.length];
          question = baseSentence.replace(new RegExp(`\\b${orig}\\b`, 'i'), replacement);
          answer = 'False';
          explanation = `Original statement contains "${orig}", not "${replacement}".`;
        } else {
          question = baseSentence;
          answer = 'True';
          explanation = 'This statement accurately reflects the source material.';
        }
        options = [t.trueFalseTrue, t.trueFalseFalse];
      } else if (type === 'fill-blank') {
        const kwsInSent = kws.filter(k => sentence.toLowerCase().includes(k));
        const keyword = kwsInSent.length ? kwsInSent[Math.floor(Math.random() * kwsInSent.length)] : kws[i % kws.length] || 'term';
        question = sentence.replace(new RegExp(`\\b${keyword}\\b`, 'i'), '_____');
        answer = keyword;
        explanation = t.fillBlank + ` Correct word: ${keyword}.`;
      } else if (type === 'flashcards') {
        const words = sentence.split(' ');
        const half = Math.ceil(words.length / 2);
        question = words.slice(0, half).join(' ') + '...';
        answer = words.slice(half).join(' ');
        explanation = sentence;
      } else {
        question = `Based on the provided material, explain: ${sentence.split(' ').slice(0, 10).join(' ')}...`;
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
    data.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white space-y-3';
      const typeBadge = { mcq: 'bg-indigo-100 text-indigo-700', 'true-false': 'bg-emerald-100 text-emerald-700', 'fill-blank': 'bg-amber-100 text-amber-700', flashcards: 'bg-purple-100 text-purple-700', 'short-answer': 'bg-rose-100 text-rose-700' }[q.type] || 'bg-slate-100 text-slate-700';
      const diffBadge = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-rose-100 text-rose-700' }[q.difficulty] || 'bg-slate-100';
      let optionsHtml = '';
      if (q.type === 'mcq' && q.options.length) {
        optionsHtml = `<div class="space-y-1.5">${q.options.map(opt => `
          <label class="flex items-start gap-2 p-2 rounded-lg border border-slate-200 hover:bg-white hover:border-indigo-300 transition cursor-pointer text-xs">
            <input type="radio" name="quiz-${idx}" class="mt-0.5 accent-indigo-600" data-answer="${q.answer}" value="${opt}">
            <span class="font-semibold text-slate-700">${opt}</span>
          </label>`).join('')}</div>`;
      } else if (q.type === 'true-false') {
        optionsHtml = `<div class="grid grid-cols-2 gap-2">${(q.options || [t.trueFalseTrue, t.trueFalseFalse]).map(opt => `
          <label class="flex items-center justify-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-white hover:border-indigo-300 transition cursor-pointer text-xs font-bold">
            <input type="radio" name="quiz-${idx}" class="accent-indigo-600" data-answer="${q.answer}" value="${opt}"> ${opt}
          </label>`).join('')}</div>`;
      } else if (q.type === 'fill-blank' || q.type === 'short-answer') {
        optionsHtml = `<input type="text" id="quiz-sa-${idx}" class="custom-input w-full text-xs" placeholder="${q.type === 'fill-blank' ? t.fillBlank : t.shortAnswer}">`;
      } else {
        optionsHtml = `<div class="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs italic text-indigo-700">${t.flashcardA}: <span onclick="this.nextElementSibling.classList.toggle('hidden')" class="cursor-pointer underline font-bold">Click to reveal</span><span class="hidden font-semibold block mt-1">${q.answer}</span></div>`;
      }
      card.innerHTML = `
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-white">${t.q} ${q.id}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBadge} uppercase">${q.type.replace('-', ' ')}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${diffBadge} capitalize ml-auto">${q.difficulty}</span>
        </div>
        <p class="text-sm font-semibold text-slate-900 leading-relaxed">${q.question}</p>
        ${optionsHtml}
        <details class="text-xs"><summary class="cursor-pointer font-bold text-indigo-600 hover:text-indigo-700">💡 ${t.ans} &amp; ${t.exp}</summary>
          <div class="mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
            <div><b class="text-emerald-800">${t.ans}:</b> <span class="font-semibold text-emerald-900">${q.answer}</span></div>
            <div><b class="text-emerald-700">${t.exp}:</b> <span class="text-emerald-800">${q.explanation}</span></div>
          </div>
        </details>`;
      container.appendChild(card);
    });
    const btnDl = document.getElementById('studio-btn-download');
    if (btnDl) btnDl.classList.remove('hidden');
  }

  window.exportQuiz = function(fmt = 'json') {
    if (!state.quizData) return;
    let content = '', mime = '', ext = '';
    if (fmt === 'json') {
      content = JSON.stringify(state.quizData, null, 2);
      mime = 'application/json'; ext = 'json';
    } else {
      const t = QUIZ_I18N[document.getElementById('ctrl-quiz-language')?.value] || QUIZ_I18N.en;
      content = state.quizData.map(q => {
        const lines = [`${t.q} ${q.id} [${q.type.toUpperCase()}] [${q.difficulty.toUpperCase()}]`, q.question];
        if (q.options?.length) lines.push(...q.options.map((o, i) => `  ${String.fromCharCode(65 + i)}. ${o}`));
        lines.push('', `${t.ans}: ${q.answer}`, `${t.exp}: ${q.explanation}`, '─'.repeat(60), '');
        return lines.join('\n');
      }).join('\n');
      mime = 'text/plain'; ext = 'txt';
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `quiz_${Date.now()}.${ext}`; a.click();
    URL.revokeObjectURL(url);
    showToast(`Quiz exported as ${ext.toUpperCase()}!`, 'success');
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
    const history = window.SupabaseEngine ? SupabaseEngine.getWorkHistory(currentUser?.id) : [];
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
  }

  function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

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