/**
 * StudioSuite OCR, Translation & WebCam Scan Engine
 */

class OCRTranslatorEngine {
  /**
   * Run client-side OCR on an image or PDF page
   * @param {File|Blob|string} imageSource - Image file, blob or dataUrl
   * @param {string} lang - Language code ('eng', 'spa', 'fra', 'deu', 'hin', 'zho', 'ara', 'rus', etc.)
   * @param {Function} onProgress - Progress callback ({ status, progress })
   */
  static async runOCR(imageSource, lang = 'eng', onProgress = null) {
    if (!window.Tesseract) {
      throw new Error('Tesseract.js library not loaded');
    }

    const worker = await window.Tesseract.createWorker(lang, 1, {
      logger: m => {
        if (onProgress && typeof onProgress === 'function') {
          onProgress(m);
        }
      }
    });

    const ret = await worker.recognize(imageSource);
    await worker.terminate();
    return ret.data.text;
  }

  /**
   * Translate text between languages using client-side translation / free MyMemory API
   * @param {string} text - Text to translate
   * @param {string} sourceLang - e.g., 'en', 'auto'
   * @param {string} targetLang - e.g., 'es', 'fr', 'de', 'hi', 'zh', 'ar', 'ru', 'ja'
   */
  static async translateText(text, sourceLang = 'auto', targetLang = 'es') {
    if (!text || !text.trim()) return '';

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 1000))}&langpair=${sourceLang}|${targetLang}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
      return text;
    } catch (e) {
      console.warn('Translation API error:', e);
      return text; // Return original if fallback fails
    }
  }

  /**
   * Translate entire PDF document page by page
   * @param {ArrayBuffer} arrayBuffer - Input PDF
   * @param {string} targetLang - Target language code ('es', 'fr', 'de', 'hi', 'zh', etc.)
   * @param {Function} onProgress - Progress callback
   */
  static async translatePDF(arrayBuffer, targetLang = 'es', onProgress = null) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      if (onProgress) onProgress({ current: i, total: pdfDoc.numPages });

      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');

      const translated = await this.translateText(pageText, 'auto', targetLang);

      if (i > 1) doc.addPage();
      
      doc.setFontSize(14);
      doc.text(`Page ${i} - Translated (${targetLang.toUpperCase()})`, 40, 40);
      doc.setFontSize(11);
      
      // Split text into multi-line wrapped paragraph
      const splitText = doc.splitTextToSize(translated, 515);
      doc.text(splitText, 40, 70);
    }

    return doc.output('arraybuffer');
  }

  /**
   * Capture Webcam stream image & enhance to PDF
   * @param {HTMLCanvasElement} canvas - Canvas element with camera frame
   * @param {Object} options - { contrast: 1.2, brightness: 1.0, binarize: false }
   */
  static async scanFrameToPDF(canvas, options = {}) {
    const { contrast = 1.2, brightness = 1.0, binarize = false } = options;

    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Apply contrast & binarization filter for scanned doc feel
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Grayscale
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Contrast & Brightness
      gray = (gray - 128) * contrast + 128 * brightness;
      gray = Math.max(0, Math.min(255, gray));

      if (binarize) {
        gray = gray > 140 ? 255 : 0;
      }

      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    ctx.putImageData(imgData, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    return await ConverterEngine.imagesToPDF([await (await fetch(dataUrl)).blob()]);
  }
}

window.OCRTranslatorEngine = OCRTranslatorEngine;
