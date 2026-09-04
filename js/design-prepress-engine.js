/**
 * StudioSuite Pro - Design, Prepress & UI/UX Generator Engine
 */

class DesignPrepressEngine {
  /**
   * Add Bleed Zones & Crop Trim Marks to PDF pages for commercial printing
   * @param {ArrayBuffer} arrayBuffer - Input PDF
   * @param {number} bleedPt - Bleed size in points (default 9pt = 1/8 inch)
   */
  static async addBleedAndTrimMarks(arrayBuffer, bleedPt = 9) {
    const { PDFDocument, rgb, degrees } = window.PDFLib;
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Expand MediaBox for bleed area
      page.setSize(width + bleedPt * 2, height + bleedPt * 2);

      const margin = bleedPt;
      const cropLen = 12;

      // Top-Left crop mark
      page.drawLine({ start: { x: margin, y: height + margin + 2 }, end: { x: margin, y: height + margin + cropLen }, thickness: 0.5, color: rgb(0, 0, 0) });
      page.drawLine({ start: { x: margin - 2, y: height + margin }, end: { x: margin - cropLen, y: height + margin }, thickness: 0.5, color: rgb(0, 0, 0) });

      // Top-Right crop mark
      page.drawLine({ start: { x: width + margin, y: height + margin + 2 }, end: { x: width + margin, y: height + margin + cropLen }, thickness: 0.5, color: rgb(0, 0, 0) });
      page.drawLine({ start: { x: width + margin + 2, y: height + margin }, end: { x: width + margin + cropLen, y: height + margin }, thickness: 0.5, color: rgb(0, 0, 0) });

      // Bottom-Left crop mark
      page.drawLine({ start: { x: margin, y: margin - 2 }, end: { x: margin, y: margin - cropLen }, thickness: 0.5, color: rgb(0, 0, 0) });
      page.drawLine({ start: { x: margin - 2, y: margin }, end: { x: margin - cropLen, y: margin }, thickness: 0.5, color: rgb(0, 0, 0) });

      // Bottom-Right crop mark
      page.drawLine({ start: { x: width + margin, y: margin - 2 }, end: { x: width + margin, y: margin - cropLen }, thickness: 0.5, color: rgb(0, 0, 0) });
      page.drawLine({ start: { x: width + margin + 2, y: margin }, end: { x: width + margin + cropLen, y: margin }, thickness: 0.5, color: rgb(0, 0, 0) });
    }

    return await doc.save();
  }

  /**
   * Convert RGB Hex color to CMYK values (Print ready)
   * @param {string} hex - e.g. '#6366f1'
   */
  static rgbToCMYK(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255 || 0;
    let g = parseInt(hex.slice(3, 5), 16) / 255 || 0;
    let b = parseInt(hex.slice(5, 7), 16) / 255 || 0;

    let k = 1 - Math.max(r, g, b);
    let c = (1 - r - k) / (1 - k) || 0;
    let m = (1 - g - k) / (1 - k) || 0;
    let y = (1 - b - k) / (1 - k) || 0;

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
      richBlack: { c: 60, m: 40, y: 40, k: 100 }
    };
  }

  /**
   * Generate CSS Glassmorphism Code
   */
  static generateGlassmorphicCSS(blur = 16, opacity = 0.2, colorHex = '#ffffff') {
    const r = parseInt(colorHex.slice(1, 3), 16) || 255;
    const g = parseInt(colorHex.slice(3, 5), 16) || 255;
    const b = parseInt(colorHex.slice(5, 7), 16) || 255;

    return `background: rgba(${r}, ${g}, ${b}, ${opacity});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border: 1px solid rgba(${r}, ${g}, ${b}, ${opacity + 0.1});
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
border-radius: 16px;`;
  }

  /**
   * Generate Organic SVG Wave Path
   */
  static generateSVGWave(colorHex = '#4f46e5', height = 120) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
  <path fill="${colorHex}" fill-opacity="1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,186.7C960,192,1056,160,1152,149.3C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
</svg>`;
  }

  /**
   * WCAG 2.1 Color Contrast Checker
   */
  static checkContrast(fgHex, bgHex) {
    const getLuminance = (hex) => {
      const rgb = [
        parseInt(hex.slice(1, 3), 16) / 255,
        parseInt(hex.slice(3, 5), 16) / 255,
        parseInt(hex.slice(5, 7), 16) / 255
      ].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };

    const l1 = getLuminance(fgHex);
    const l2 = getLuminance(bgHex);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio: Math.round(ratio * 100) / 100,
      passAA: ratio >= 4.5,
      passAAA: ratio >= 7.0,
      passLargeAA: ratio >= 3.0
    };
  }
}

window.DesignPrepressEngine = DesignPrepressEngine;
