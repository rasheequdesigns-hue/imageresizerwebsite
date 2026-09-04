/**
 * StudioSuite Pro - Developer, Media & Typography Engine
 */

class MediaDeveloperEngine {
  /**
   * Optimize SVG Markup code (SVGO client-side regex cleaner)
   */
  static optimizeSVG(svgText) {
    if (!svgText) return '';
    let clean = svgText
      .replace(/<!--[\s\S]*?-->/g, '') // Remove XML comments
      .replace(/<\?xml[\s\S]*?\?>/g, '') // Remove XML header
      .replace(/<!DOCTYPE[\s\S]*?>/i, '') // Remove DOCTYPE
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/>\s+</g, '><')
      .trim();

    return clean;
  }

  /**
   * PX to REM / EM Converter
   */
  static pxToREM(px, base = 16) {
    return (parseFloat(px) / base).toFixed(4) + 'rem';
  }

  static remToPX(rem, base = 16) {
    return Math.round(parseFloat(rem) * base) + 'px';
  }

  /**
   * Text Case Transformer
   */
  static convertTextCase(text, mode = 'title') {
    if (!text) return '';
    switch(mode) {
      case 'uppercase': return text.toUpperCase();
      case 'lowercase': return text.toLowerCase();
      case 'title': return text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      case 'camel': return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
      case 'kebab': return text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
      case 'snake': return text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
      default: return text;
    }
  }

  /**
   * Generate OpenGraph & Social Meta Tags
   */
  static generateOpenGraphMeta(config = {}) {
    const { title = 'My Web Page', desc = 'Description...', image = 'https://example.com/og.png', url = 'https://example.com' } = config;
    return `<!-- Essential OpenGraph & Social Tags -->
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${image}">`;
  }

  /**
   * Convert File to Base64 String
   */
  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

window.MediaDeveloperEngine = MediaDeveloperEngine;
