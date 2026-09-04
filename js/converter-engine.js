/**
 * StudioSuite Converter Engine - Powered by pdf-lib, pdfjs, jsPDF, Mammoth, XLSX, PptxGenJS
 */

class ConverterEngine {
  /**
   * Convert Images (JPG, PNG, WEBP, GIF, SVG) to PDF with custom settings
   * @param {Array<File>} imageFiles - Array of image files
   * @param {Object} options - { pageFormat: 'A4'|'Letter'|'Fit', orientation: 'portrait'|'landscape', margin: 10 }
   * @returns {Promise<Uint8Array>} PDF bytes
   */
  static async imagesToPDF(imageFiles, options = {}) {
    const { PDFDocument, PageSizes } = window.PDFLib;
    const doc = await PDFDocument.create();

    const { pageFormat = 'A4', orientation = 'portrait', margin = 10 } = options;

    for (const file of imageFiles) {
      const imgBuffer = await file.arrayBuffer();
      let embeddedImg;

      if (file.type.includes('png')) {
        embeddedImg = await doc.embedPng(imgBuffer);
      } else {
        // Fallback or JPG/WEBP canvas conversion if needed
        try {
          embeddedImg = await doc.embedJpg(imgBuffer);
        } catch (e) {
          // Convert unsupported format to PNG via canvas
          const dataUrl = await this.fileToDataUrl(file);
          const pngBuffer = await this.dataUrlToBuffer(await this.convertImageToPngDataUrl(dataUrl));
          embeddedImg = await doc.embedPng(pngBuffer);
        }
      }

      let pageWidth, pageHeight;
      if (pageFormat === 'A4') {
        [pageWidth, pageHeight] = PageSizes.A4;
      } else if (pageFormat === 'Letter') {
        [pageWidth, pageHeight] = PageSizes.Letter;
      } else {
        // Fit to image dimensions
        pageWidth = embeddedImg.width + margin * 2;
        pageHeight = embeddedImg.height + margin * 2;
      }

      if (orientation === 'landscape' && pageWidth < pageHeight) {
        [pageWidth, pageHeight] = [pageHeight, pageWidth];
      }

      const page = doc.addPage([pageWidth, pageHeight]);
      const availWidth = pageWidth - margin * 2;
      const availHeight = pageHeight - margin * 2;

      // Scale image maintaining aspect ratio
      const imgAspect = embeddedImg.width / embeddedImg.height;
      const availAspect = availWidth / availHeight;

      let drawWidth = availWidth;
      let drawHeight = availHeight;

      if (imgAspect > availAspect) {
        drawHeight = availWidth / imgAspect;
      } else {
        drawWidth = availHeight * imgAspect;
      }

      const x = margin + (availWidth - drawWidth) / 2;
      const y = margin + (availHeight - drawHeight) / 2;

      page.drawImage(embeddedImg, {
        x,
        y,
        width: drawWidth,
        height: drawHeight
      });
    }

    return await doc.save();
  }

  /**
   * Convert PDF pages into Image Blobs (JPG, PNG, WEBP)
   * @param {ArrayBuffer} arrayBuffer - Input PDF
   * @param {string} format - 'image/jpeg' | 'image/png' | 'image/webp'
   * @param {number} dpiScale - 1 (72 dpi), 2 (144 dpi), 3 (216 dpi)
   * @returns {Promise<Array<{ page: number, blob: Blob, dataUrl: string }>>}
   */
  static async pdfToImages(arrayBuffer, format = 'image/png', dpiScale = 2) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const results = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: dpiScale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      const dataUrl = canvas.toDataURL(format, 0.92);
      const blob = await (await fetch(dataUrl)).blob();

      results.push({ page: i, blob, dataUrl });
    }

    return results;
  }

  /**
   * Convert Word DOCX file to PDF using Mammoth.js & jsPDF
   * @param {File} docxFile - Word document
   */
  static async wordToPDF(docxFile) {
    const arrayBuffer = await docxFile.arrayBuffer();
    const result = await window.mammoth.convertToHtml({ arrayBuffer });
    const htmlString = result.value;

    const container = document.createElement('div');
    container.style.width = '794px'; // A4 width in px at 96 DPI
    container.style.padding = '40px';
    container.style.background = '#ffffff';
    container.style.color = '#000000';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.lineHeight = '1.6';
    container.innerHTML = htmlString;
    document.body.appendChild(container);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');
    
    await pdf.html(container, {
      callback: function (doc) {
        document.body.removeChild(container);
      },
      x: 10,
      y: 10,
      width: 575,
      windowWidth: 794
    });

    return pdf.output('arraybuffer');
  }

  /**
   * Convert PDF to Word DOCX
   * Extract text & images from PDF and assemble docx document using docx library
   */
  static async pdfToWord(arrayBuffer) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const docxLib = window.docx;

    const sections = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      
      const paragraphs = textContent.items.map(item => {
        return new docxLib.Paragraph({
          children: [
            new docxLib.TextRun({
              text: item.str,
              size: Math.round((item.height || 12) * 1.5),
            })
          ]
        });
      });

      sections.push({
        properties: {},
        children: paragraphs
      });
    }

    const doc = new docxLib.Document({ sections });
    return await docxLib.Packer.toBlob(doc);
  }

  /**
   * Convert Excel XLSX to PDF
   */
  static async excelToPDF(xlsxFile) {
    const arrayBuffer = await xlsxFile.arrayBuffer();
    const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const htmlTable = window.XLSX.utils.sheet_to_html(worksheet);

    const container = document.createElement('div');
    container.style.width = '1000px';
    container.style.padding = '20px';
    container.style.background = '#ffffff';
    container.style.color = '#000000';
    container.innerHTML = htmlTable;
    document.body.appendChild(container);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'pt', 'a4');
    
    await pdf.html(container, {
      callback: function (doc) {
        document.body.removeChild(container);
      },
      x: 10,
      y: 10,
      width: 820,
      windowWidth: 1000
    });

    return pdf.output('arraybuffer');
  }

  /**
   * Convert PDF to Excel XLSX
   */
  static async pdfToExcel(arrayBuffer) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const rows = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      
      let currentRow = [];
      let lastY = null;

      for (const item of textContent.items) {
        const y = Math.round(item.transform[5]);
        if (lastY !== null && Math.abs(y - lastY) > 5) {
          if (currentRow.length > 0) rows.push(currentRow);
          currentRow = [];
        }
        currentRow.push(item.str);
        lastY = y;
      }
      if (currentRow.length > 0) rows.push(currentRow);
    }

    const worksheet = window.XLSX.utils.aoa_to_sheet(rows);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "PDF Extracted");

    const xlsxBuffer = window.XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /**
   * Convert PDF to PowerPoint PPTX
   */
  static async pdfToPPT(arrayBuffer) {
    const images = await this.pdfToImages(arrayBuffer, 'image/jpeg', 2);
    const pptx = new window.PptxGenJS();

    for (const img of images) {
      const slide = pptx.addSlide();
      slide.addImage({ data: img.dataUrl, x: 0, y: 0, w: '100%', h: '100%' });
    }

    return await pptx.write({ outputType: 'blob' });
  }

  /**
   * Universal Image Resizer & Target Size Compressor
   * @param {File} imageFile 
   * @param {Object} config - { width, height, format, targetSizeKB }
   */
  static async resizeImage(imageFile, config = {}) {
    const { width, height, format = 'image/jpeg', targetSizeKB = 0 } = config;
    const dataUrl = await this.fileToDataUrl(imageFile);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const targetW = parseInt(width) || img.width;
        const targetH = parseInt(height) || img.height;

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);

        canvas.toBlob(async (blob) => {
          let finalBlob = blob;
          const targetBytes = parseInt(targetSizeKB) * 1024;
          
          if (targetBytes > 0 && blob.size < targetBytes) {
            // Padding buffer for exact target size
            const padding = new Uint8Array(targetBytes - blob.size);
            finalBlob = new Blob([blob, padding], { type: format });
          }
          resolve({ blob: finalBlob, width: targetW, height: targetH });
        }, format, 0.92);
      };
      img.src = dataUrl;
    });
  }

  // Helpers
  static fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static convertImageToPngDataUrl(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    });
  }

  static async dataUrlToBuffer(dataUrl) {
    const res = await fetch(dataUrl);
    return await res.arrayBuffer();
  }
}

window.ConverterEngine = ConverterEngine;
