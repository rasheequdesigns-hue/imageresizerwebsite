/**
 * StudioSuite PDF Engine - Powered by PDF-Lib & PDFJS
 */

class PDFEngine {
  /**
   * Inspect PDF Page Count
   */
  static async getPDFPageCount(arrayBuffer) {
    const { PDFDocument } = window.PDFLib;
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return doc.getPageCount();
  }

  /**
   * Render individual PDF page thumbnails as Data URLs
   * @param {ArrayBuffer} arrayBuffer 
   * @returns {Promise<Array<{ pageIndex: number, pageNum: number, dataUrl: string, rotation: number }>>}
   */
  static async renderPageThumbnails(arrayBuffer) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const pageList = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 0.4 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport }).promise;

      pageList.push({
        pageIndex: i - 1,
        pageNum: i,
        dataUrl: canvas.toDataURL('image/jpeg', 0.8),
        rotation: 0,
        deleted: false
      });
    }

    return pageList;
  }

  /**
   * Re-assemble PDF with custom page order, rotations, and deletions
   * @param {ArrayBuffer} arrayBuffer 
   * @param {Array<{ pageIndex: number, rotation: number, deleted: boolean }>} pageConfigList 
   */
  static async compileOrganizedPDF(arrayBuffer, pageConfigList) {
    const { PDFDocument, degrees } = window.PDFLib;
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    const activePages = pageConfigList.filter(p => !p.deleted);

    for (const item of activePages) {
      const [copiedPage] = await newDoc.copyPages(srcDoc, [item.pageIndex]);
      if (item.rotation) {
        copiedPage.setRotation(degrees(item.rotation));
      }
      newDoc.addPage(copiedPage);
    }

    return await newDoc.save();
  }

  /**
   * Merge multiple PDF files into one single PDF document
   */
  static async mergePDFs(files) {
    const { PDFDocument } = window.PDFLib;
    const mergedDoc = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedDoc.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    }

    return await mergedDoc.save();
  }

  /**
   * Split / extract pages from a PDF document
   */
  static async splitPDF(arrayBuffer, pageNumbers = [], splitAllIndividual = false) {
    const { PDFDocument } = window.PDFLib;
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    if (splitAllIndividual) {
      const zip = new window.JSZip();

      for (let i = 0; i < totalPages; i++) {
        const newDoc = await PDFDocument.create();
        const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(copiedPage);
        const singlePdfBytes = await newDoc.save();
        zip.file(`page_${i + 1}.pdf`, singlePdfBytes);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      return { zipBlob };
    } else {
      const newDoc = await PDFDocument.create();
      const zeroBasedIndices = pageNumbers
        .map(num => parseInt(num) - 1)
        .filter(idx => idx >= 0 && idx < totalPages);

      const copiedPages = await newDoc.copyPages(srcDoc, zeroBasedIndices);
      copiedPages.forEach((page) => newDoc.addPage(page));

      const pdfBytes = await newDoc.save();
      return { pdfBytes };
    }
  }

  /**
   * Add text or image watermark to PDF pages
   */
  static async addWatermark(arrayBuffer, config = {}) {
    const { PDFDocument, rgb, degrees, StandardFonts } = window.PDFLib;
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    const {
      text = 'CONFIDENTIAL',
      fontSize = 48,
      colorHex = '#4f46e5',
      opacity = 0.35,
      rotation = 45
    } = config;

    const helveticaFont = await doc.embedFont(StandardFonts.HelveticaBold);

    const r = parseInt(colorHex.slice(1, 3), 16) / 255 || 0.31;
    const g = parseInt(colorHex.slice(3, 5), 16) / 255 || 0.27;
    const b = parseInt(colorHex.slice(5, 7), 16) / 255 || 0.9;

    for (const page of pages) {
      const { width, height } = page.getSize();
      const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: height / 2,
        size: fontSize,
        font: helveticaFont,
        color: rgb(r, g, b),
        opacity: parseFloat(opacity),
        rotate: degrees(parseFloat(rotation))
      });
    }

    return await doc.save();
  }

  /**
   * Password protect PDF document
   */
  static async protectPDF(arrayBuffer, userPassword, ownerPassword = null) {
    const { PDFDocument } = window.PDFLib;
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    return await doc.save({
      userPassword: userPassword,
      ownerPassword: ownerPassword || userPassword,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false
      }
    });
  }

  /**
   * Unlock password-protected PDF
   */
  static async unlockPDF(arrayBuffer, password) {
    const { PDFDocument } = window.PDFLib;
    const doc = await PDFDocument.load(arrayBuffer, { password });
    return await doc.save();
  }

  /**
   * Compress PDF by re-encoding pages / downsampling images via canvas
   */
  static async compressPDF(arrayBuffer, quality = 0.5, scale = 0.8) {
    const { PDFDocument } = window.PDFLib;
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const newPdfDoc = await PDFDocument.create();

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
      const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());
      const embeddedImg = await newPdfDoc.embedJpg(imgBytes);

      const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
      newPage.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      });
    }

    return await newPdfDoc.save();
  }

  /**
   * Add signature overlay to PDF page
   */
  static async signPDF(arrayBuffer, signatureDataUrl, options = {}) {
    const { PDFDocument } = window.PDFLib;
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    
    const { pageNum = 1, x = 50, y = 50, width = 150, height = 60 } = options;
    const pageIndex = Math.max(0, Math.min(pageNum - 1, doc.getPageCount() - 1));
    const page = doc.getPages()[pageIndex];

    const sigImageBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer());
    const embeddedSig = await doc.embedPng(sigImageBytes);

    page.drawImage(embeddedSig, {
      x: parseFloat(x),
      y: parseFloat(y),
      width: parseFloat(width),
      height: parseFloat(height)
    });

    return await doc.save();
  }

  /**
   * Crop PDF pages
   */
  static async cropPDF(arrayBuffer, cropMargins = {}) {
    const { PDFDocument } = window.PDFLib;
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    const { left = 20, bottom = 20, right = 20, top = 20 } = cropMargins;

    for (const page of pages) {
      const { width, height } = page.getSize();
      page.setCropBox(
        parseFloat(left),
        parseFloat(bottom),
        Math.max(10, width - parseFloat(left) - parseFloat(right)),
        Math.max(10, height - parseFloat(bottom) - parseFloat(top))
      );
    }

    return await doc.save();
  }
}

window.PDFEngine = PDFEngine;
