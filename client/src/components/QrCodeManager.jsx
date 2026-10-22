import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode, Download, Printer, Copy, X, ExternalLink,
  Camera, Upload, Check, AlertCircle, Sparkles, RefreshCw
} from 'lucide-react';
import { getVerificationUrl } from '../api';

/**
 * High-resolution client-side PNG download from SVG QR Code
 * Adds quiet zone and crisp resolution without server calls
 */
export const downloadQrPng = (passportId, productName = 'Product') => {
  const svg = document.getElementById(`qr-code-svg-${passportId}`);
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = () => {
    const size = 1200;
    canvas.width = size;
    canvas.height = size;
    // White background for proper quiet zone
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    // 10% quiet zone on all sides
    const padding = size * 0.1;
    ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

    const link = document.createElement('a');
    link.download = `${passportId}-GreenWeave-QR.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
};

/**
 * Printable tag with GreenWeave branding, product name, passport ID,
 * quiet zone, and verification instructions
 */
export const printQrCode = (product, verificationUrl) => {
  const svg = document.getElementById(`qr-code-svg-${product.passport_id}`);
  const svgHtml = svg ? svg.outerHTML : '';
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>GreenWeave DPP · ${product.passport_id}</title>
  <style>
    @page { size: auto; margin: 10mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 90vh;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .passport-tag {
      width: 390px;
      background: #ffffff;
      border: 2px solid #059669;
      border-radius: 20px;
      padding: 26px 22px;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      box-sizing: border-box;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .logo-badge {
      background: #059669;
      color: #ffffff;
      font-weight: 900;
      font-size: 13px;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .title {
      font-size: 16px;
      font-weight: 800;
      color: #064e3b;
      letter-spacing: -0.2px;
    }
    .subtitle {
      font-size: 11px;
      font-weight: 600;
      color: #059669;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 3px 12px;
      border-radius: 999px;
      display: inline-block;
      margin-bottom: 14px;
    }
    .qr-frame {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px;
      display: inline-block;
      margin: 2px 0 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    .qr-frame svg {
      width: 210px;
      height: 210px;
      display: block;
    }
    .product-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px;
    }
    .passport-pill {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      font-weight: 700;
      color: #047857;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 4px 10px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 12px;
    }
    .metadata-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 10px;
      text-align: left;
      font-size: 11px;
      background: #f8fafc;
      padding: 10px 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      border: 1px solid #e2e8f0;
    }
    .meta-item span:first-child {
      color: #64748b;
      font-weight: 600;
      margin-right: 4px;
    }
    .meta-item span:last-child {
      color: #1e293b;
      font-weight: 700;
    }
    .instruction-box {
      border-top: 1px dashed #cbd5e1;
      padding-top: 10px;
      font-size: 10.5px;
      color: #475569;
      line-height: 1.4;
    }
    .url-display {
      font-family: monospace;
      font-size: 9px;
      color: #94a3b8;
      word-break: break-all;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="passport-tag">
    <div class="header">
      <span class="logo-badge">GW</span>
      <span class="title">GreenWeave DPP</span>
    </div>
    <div class="subtitle">Cryptographic Product Passport</div>
    <div class="qr-frame">
      ${svgHtml}
    </div>
    <h1 class="product-title">${product.name}</h1>
    <div class="passport-pill">${product.passport_id}</div>
    <div class="metadata-grid">
      <div class="meta-item"><span>SKU:</span><span>${product.sku || 'N/A'}</span></div>
      <div class="meta-item"><span>Batch:</span><span>${product.batch_number || 'N/A'}</span></div>
      <div class="meta-item"><span>Category:</span><span>${product.category || 'Textiles'}</span></div>
      <div class="meta-item"><span>Status:</span><span>${product.status || 'Active'}</span></div>
    </div>
    <div class="instruction-box">
      Scan with any smartphone camera to verify authentic lifecycle history anchored by SHA-256 cryptographic hashes.
    </div>
    <div class="url-display">${verificationUrl}</div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>
  `);
  printWindow.document.close();
};

/**
 * Direct React QR Code Display with Quiet Zone and Controls
 */
export function QRCodeCard({ product, size = 180, onToast }) {
  const [copied, setCopied] = useState(false);
  const verificationUrl = getVerificationUrl(product.passport_id);

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    if (onToast) onToast('Verification link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Printable / downloadable QR container with white quiet zone */}
      <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-slate-200 inline-block transition-transform hover:scale-[1.02]">
        <QRCode
          id={`qr-code-svg-${product.passport_id}`}
          value={verificationUrl}
          size={size}
          level="Q"
          bgColor="#ffffff"
          fgColor="#022c22"
        />
      </div>

      <p className="mt-2 text-[10px] font-mono text-slate-400 break-all text-center max-w-[240px]">
        {verificationUrl}
      </p>

      {/* Action Buttons */}
      <div className="mt-3 flex flex-wrap gap-2 justify-center w-full">
        <button
          type="button"
          onClick={() => downloadQrPng(product.passport_id, product.name)}
          className="btn-primary !px-3 !py-1.5 text-xs font-bold"
          title="Download high-resolution PNG for packaging labels"
        >
          <Download size={13} /> PNG
        </button>
        <button
          type="button"
          onClick={() => printQrCode(product, verificationUrl)}
          className="btn-secondary !px-3 !py-1.5 text-xs"
          title="Print official GreenWeave passport card"
        >
          <Printer size={13} /> Print
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="btn-ghost !px-2.5 !py-1.5 text-xs text-slate-300 hover:text-white"
          title="Copy URL"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}

/**
 * Standalone Modal for displaying, downloading and printing a product's QR code
 */
export function QrPassportModal({ product, onClose, onToast }) {
  if (!product) return null;
  const verificationUrl = getVerificationUrl(product.passport_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md p-6 sm:p-7 border-slate-800 shadow-2xl relative animate-scale-in text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1"
        >
          <X size={20} />
        </button>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 text-xs font-bold text-emerald-400 mb-3">
          <Sparkles size={13} /> GreenWeave Public QR Passport
        </div>

        <h3 className="text-xl font-black text-slate-100">{product.name}</h3>
        <p className="mt-1 font-mono text-xs text-emerald-400 font-bold bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 inline-block">
          {product.passport_id}
        </p>

        <div className="mt-5 flex justify-center">
          <QRCodeCard product={product} size={200} onToast={onToast} />
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <a
            href={`/verify/${encodeURIComponent(product.passport_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
          >
            <ExternalLink size={13} /> Open Verify Page
          </a>
          <button
            onClick={onClose}
            className="btn-secondary !px-3 !py-1 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * In-Browser QR Scanner Component (Live camera feed + Image File Drop/Upload)
 */
export function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [mode, setMode] = useState('camera'); // 'camera' | 'file'
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const containerId = 'qr-camera-scanner-view';

  // Handle successful scan
  const handleDecoded = (decodedText) => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().catch(() => {});
      } catch {
        // ignore
      }
    }
    // Extract passport ID if it's a URL like /verify/DPP-GW-2026-0001
    let extracted = decodedText.trim();
    const urlMatch = extracted.match(/\/verify\/([^/?#]+)/i);
    if (urlMatch && urlMatch[1]) {
      extracted = decodeURIComponent(urlMatch[1]);
    }
    onScanSuccess(extracted);
    onClose();
  };

  // Start camera
  useEffect(() => {
    if (!isOpen || mode !== 'camera') {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
      setIsScanning(false);
      return;
    }

    const timer = setTimeout(() => {
      setErrorMsg('');
      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleDecoded(decodedText),
          () => {} // silence frame scan errors
        )
        .then(() => setIsScanning(true))
        .catch((err) => {
          setIsScanning(false);
          setErrorMsg(
            typeof err === 'string'
              ? err
              : 'Unable to access camera. Please allow camera permissions or upload an image of the QR code.'
          );
        });
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen, mode]);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    try {
      const html5QrCode = new Html5Qrcode('qr-temp-file-decoder');
      const result = await html5QrCode.scanFile(file, true);
      handleDecoded(result);
    } catch {
      setErrorMsg('No readable QR code found in this image. Please ensure the QR code is clearly visible and well-lit.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md p-6 border-slate-800 shadow-2xl relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <QrCode size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-100">Scan Product Passport QR</h3>
            <p className="text-xs text-slate-400">Scan packaging with camera or upload image</p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={`btn !py-2 text-xs font-semibold flex items-center justify-center gap-2 rounded-xl transition-all ${
              mode === 'camera'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera size={14} /> Live Camera
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`btn !py-2 text-xs font-semibold flex items-center justify-center gap-2 rounded-xl transition-all ${
              mode === 'file'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload size={14} /> Upload Image
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {mode === 'camera' ? (
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[260px] flex items-center justify-center">
            <div id={containerId} className="w-full h-full" />
            {!isScanning && !errorMsg && (
              <div className="absolute flex flex-col items-center gap-2 text-xs text-slate-400">
                <RefreshCw size={20} className="animate-spin text-emerald-400" />
                <span>Starting camera feed...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/80 p-8 text-center hover:border-emerald-500/40 transition-colors">
            <input
              type="file"
              accept="image/*"
              id="qr-file-input"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="qr-file-input"
              className="cursor-pointer flex flex-col items-center gap-2 text-xs text-slate-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                <Upload size={22} />
              </div>
              <span className="font-bold text-slate-200 text-sm">Choose or Drop QR Image</span>
              <span className="text-slate-500 text-[11px]">Supports PNG, JPG, WEBP screenshots</span>
              <span className="btn-secondary !py-1.5 !px-3 mt-2 text-xs">Browse Files</span>
            </label>
            <div id="qr-temp-file-decoder" className="hidden" />
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="btn-ghost text-xs">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
