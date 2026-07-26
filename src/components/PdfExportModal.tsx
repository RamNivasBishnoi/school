import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileText, Download, Printer, Settings2, Check, X, Sliders } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  elementIdToExport: string; // HTML element ID to render into PDF
  defaultFilename?: string;
}

// Helper to convert OKLCH color strings to standard RGB/RGBA for html2canvas compatibility
function oklchToRgbString(oklchStr: string): string {
  try {
    const match = oklchStr.match(/oklch\(\s*([\d.%]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/i);
    if (!match) return 'rgb(100, 100, 100)';

    let l = parseFloat(match[1]);
    if (match[1].endsWith('%')) l /= 100;

    const c = parseFloat(match[2]);
    const h = parseFloat(match[3]);

    let a = 1;
    if (match[4]) {
      a = parseFloat(match[4]);
      if (match[4].endsWith('%')) a /= 100;
    }

    const hRad = (h * Math.PI) / 180;
    const aLab = c * Math.cos(hRad);
    const bLab = c * Math.sin(hRad);

    const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
    const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
    const s_ = l - 0.0894841775 * aLab - 1.2914855480 * bLab;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    const toSrgb = (val: number) => {
      val = Math.max(0, Math.min(1, val));
      return val <= 0.0031308
        ? Math.round(val * 12.92 * 255)
        : Math.round((1.055 * Math.pow(val, 1 / 2.4) - 0.055) * 255);
    };

    const r = toSrgb(rLin);
    const g = toSrgb(gLin);
    const b = toSrgb(bLin);

    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
  } catch (e) {
    return 'rgb(120, 120, 120)';
  }
}

export default function PdfExportModal({
  isOpen,
  onClose,
  title,
  elementIdToExport,
  defaultFilename = 'document.pdf'
}: PdfExportModalProps) {
  const [pageSize, setPageSize] = useState<'a4' | 'a3' | 'letter' | 'legal'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(10); // in mm
  const [quality, setQuality] = useState<number>(2); // scale factor
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [customFilename, setCustomFilename] = useState<string>(defaultFilename);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    const targetElement = document.getElementById(elementIdToExport);
    if (!targetElement) {
      alert('PDF जनरेट करने के लिए दस्तावेज़ तत्व नहीं मिला।');
      return;
    }

    setIsGenerating(true);
    try {
      // Render HTML to canvas with OKLCH color fallback
      const canvas = await html2canvas(targetElement, {
        scale: quality,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Replace oklch in all <style> tags
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((style) => {
            if (style.textContent && style.textContent.includes('oklch')) {
              style.textContent = style.textContent.replace(/oklch\([^)]+\)/gi, (m) => oklchToRgbString(m));
            }
          });

          // Replace oklch in inline styles and computed properties
          const allEls = clonedDoc.querySelectorAll('*');
          allEls.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style && htmlEl.style.cssText && htmlEl.style.cssText.includes('oklch')) {
              htmlEl.style.cssText = htmlEl.style.cssText.replace(/oklch\([^)]+\)/gi, (m) => oklchToRgbString(m));
            }
            try {
              const comp = window.getComputedStyle(htmlEl);
              ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'].forEach((prop) => {
                const val = comp.getPropertyValue(prop);
                if (val && val.includes('oklch')) {
                  const converted = val.replace(/oklch\([^)]+\)/gi, (m) => oklchToRgbString(m));
                  htmlEl.style.setProperty(prop, converted, 'important');
                }
              });
            } catch (e) {
              // ignore computed style evaluation errors
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/png');

      // Initialize jsPDF
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const printableWidth = pdfWidth - (margin * 2);
      const printableHeight = pdfHeight - (margin * 2);

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * printableWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = margin;

      // First page
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position,
        printableWidth,
        Math.min(imgHeight, printableHeight)
      );
      heightLeft -= printableHeight;

      // Handle multi-page documents
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          position - margin,
          printableWidth,
          imgHeight
        );
        heightLeft -= printableHeight;
      }

      pdf.save(customFilename.endsWith('.pdf') ? customFilename : `${customFilename}.pdf`);
      onClose();
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('PDF जनरेट करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintDocument = () => {
    const targetElement = document.getElementById(elementIdToExport);
    if (!targetElement) {
      alert('प्रिंट करने के लिए दस्तावेज़ तत्व नहीं मिला।');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Fallback if popup blocked: print directly
      window.print();
      return;
    }

    // Collect all existing page styles so styling is preserved on GitHub Pages
    let stylesHtml = '';
    try {
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
      stylesHtml = styles.map(s => s.outerHTML).join('\n');
    } catch (e) {
      // ignore
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          ${stylesHtml}
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: ${margin}mm; background: #ffffff !important; color: #000000 !important; }
            @page { size: ${pageSize} ${orientation}; margin: ${margin}mm; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          </style>
        </head>
        <body>
          <div className="pdf-print-wrapper">
            ${targetElement.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">PDF एक्सपोर्ट व प्रिंट सेटअप</h3>
              <p className="text-xs text-indigo-100">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* File name */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              फ़ाइल का नाम (PDF File Name)
            </label>
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Page Format & Orientation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                पेज का साइज़ (Page Size)
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="a4">📄 A4 (Standard - 210x297mm)</option>
                <option value="a3">📜 A3 (Large - 297x420mm)</option>
                <option value="letter">📝 Letter (216x279mm)</option>
                <option value="legal">⚖️ Legal (216x356mm)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                ओरिएंटेशन (Orientation)
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="portrait">📱 Portrait (खड़ा / वर्टिकल)</option>
                <option value="landscape">🖥️ Landscape (आड़ा / हॉरिज़ॉन्टल)</option>
              </select>
            </div>
          </div>

          {/* Margin Setup */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                पेज मार्जिन (Margin)
              </label>
              <span className="font-black text-indigo-600 dark:text-indigo-400">{margin} mm</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={2}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
              <span>0mm (कोई मार्जिन नहीं)</span>
              <span>10mm (सामान्य)</span>
              <span>30mm (बड़ा मार्जिन)</span>
            </div>
          </div>

          {/* Render Quality */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              क्वालिटी व शार्पनेस (Resolution Quality)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQuality(1.5)}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                  quality === 1.5
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Normal (फास्ट)
              </button>
              <button
                type="button"
                onClick={() => setQuality(2)}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                  quality === 2
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                HD (अनुशंसित)
              </button>
              <button
                type="button"
                onClick={() => setQuality(3)}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                  quality === 3
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Ultra HD (अति-स्पष्ट)
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-850 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintDocument}
            className="flex-1 py-2.5 px-3 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4 text-zinc-500" />
            <span>डायरेक्ट प्रिंट (Print)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {isGenerating ? (
              <span>PDF बन रहा है...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>PDF डाउनलोड करें</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
