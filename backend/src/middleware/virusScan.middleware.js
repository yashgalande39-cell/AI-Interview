/**
 * TRESK AI — Virus Scan Middleware
 * =====================================================================
 * Scans uploaded file buffers for malware before persisting to disk or S3.
 * Uses clamscan (Node.js wrapper for ClamAV) in production.
 *
 * For local development without ClamAV installed, set:
 *   VIRUS_SCAN_ENABLED=false
 * in your .env — the middleware will log a warning and pass through.
 *
 * Install ClamAV:
 *   Ubuntu/Debian: sudo apt-get install clamav clamav-daemon
 *   macOS:         brew install clamav
 *   Docker:        Use clamav/clamav image as a sidecar.
 *
 * Install Node wrapper:
 *   npm install clamscan
 *
 * ClamAV daemon must be running:
 *   sudo freshclam         # Update virus definitions
 *   sudo clamd             # Start daemon
 */

const SCAN_ENABLED = process.env.VIRUS_SCAN_ENABLED === 'true';

// ─── ClamAV Client (lazy init) ───────────────────────────────────────────────

let _scanner = null;
let _scannerReady = false;

async function getScanner() {
  if (_scanner && _scannerReady) return _scanner;

  try {
    const NodeClam = require('clamscan');
    _scanner = await new NodeClam().init({
      removeInfected: false,       // Don't delete — we'll reject the request instead
      quarantineInfected: false,
      scanLog: null,
      debugMode: false,
      preference: 'clamdscan',     // Use the faster daemon instead of clamscan CLI
      clamdscan: {
        socket: process.env.CLAMAV_SOCKET || '/var/run/clamav/clamd.sock',
        host: process.env.CLAMAV_HOST || '127.0.0.1',
        port: parseInt(process.env.CLAMAV_PORT || '3310'),
        timeout: 30000,
        localFallback: true,
        path: '/usr/bin/clamdscan',
        config_file: '/etc/clamav/clamd.conf',
        multiscan: true,
        reloadDb: false,
        active: true,
        bypassRest: false,
      },
      clamscan: {
        path: '/usr/bin/clamscan',
        active: false,    // Fallback only — slower than daemon
      },
    });
    _scannerReady = true;
    console.log('[VirusScan] ClamAV scanner initialized successfully.');
    return _scanner;
  } catch (err) {
    console.error('[VirusScan] Failed to initialize ClamAV scanner:', err.message);
    console.error('[VirusScan] Is ClamAV installed and clamd running? Try: sudo clamd');
    throw new Error(`ClamAV initialization failed: ${err.message}`);
  }
}

// ─── File Type Validation (extension + magic bytes) ─────────────────────────

const ALLOWED_FILE_SIGNATURES = {
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46],  // %PDF
  ],
  'application/msword': [
    [0xD0, 0xCF, 0x11, 0xE0],  // Compound Document (old .doc)
  ],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    [0x50, 0x4B, 0x03, 0x04],  // ZIP header (DOCX/XLSX are ZIP archives)
  ],
  'audio/webm': [
    [0x1A, 0x45, 0xDF, 0xA3],  // EBML/WebM
  ],
  'audio/ogg': [
    [0x4F, 0x67, 0x67, 0x53],  // OggS
  ],
  'audio/mpeg': [
    [0xFF, 0xFB],               // MP3
    [0xFF, 0xF3],
    [0x49, 0x44, 0x33],        // ID3 tagged MP3
  ],
};

/**
 * Validate a file buffer against known magic byte signatures for its MIME type.
 * Prevents MIME type spoofing (e.g. renaming a .exe to .pdf).
 *
 * @param {Buffer} buffer - Raw file bytes
 * @param {string} contentType - Declared MIME type
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateMagicBytes(buffer, contentType) {
  const signatures = ALLOWED_FILE_SIGNATURES[contentType];

  // If we don't have a defined signature for this type, allow it
  // (it will still go through virus scan)
  if (!signatures) return { valid: true };

  for (const sig of signatures) {
    if (sig.every((byte, i) => buffer[i] === byte)) {
      return { valid: true };
    }
  }

  return {
    valid: false,
    reason: `File magic bytes do not match declared content type "${contentType}". Possible file type spoofing attempt.`,
  };
}

// ─── Core Scan Function ──────────────────────────────────────────────────────

/**
 * Scan a file buffer for viruses and validate its magic bytes.
 *
 * @param {Buffer} fileBuffer - Raw file content
 * @param {string} contentType - MIME type of the file
 * @param {string} originalname - Original filename (for logging)
 * @returns {Promise<{ safe: boolean, threat?: string, reason?: string }>}
 */
async function scanBuffer(fileBuffer, contentType, originalname) {
  // 1. Magic byte validation (fast, no ClamAV needed)
  const magicResult = validateMagicBytes(fileBuffer, contentType);
  if (!magicResult.valid) {
    return { safe: false, threat: 'MAGIC_BYTE_MISMATCH', reason: magicResult.reason };
  }

  // 2. Size sanity check (belt and suspenders alongside multer limits)
  const maxBytes = 10 * 1024 * 1024; // 10 MB
  if (fileBuffer.length > maxBytes) {
    return {
      safe: false,
      threat: 'FILE_TOO_LARGE',
      reason: `File exceeds maximum allowed size of ${maxBytes / 1024 / 1024} MB.`,
    };
  }

  if (!SCAN_ENABLED) {
    console.warn(`[VirusScan] VIRUS_SCAN_ENABLED=false — skipping ClamAV scan for "${originalname}".`);
    return { safe: true };
  }

  // 3. ClamAV scan
  try {
    const scanner = await getScanner();
    const { isInfected, viruses } = await scanner.scanBuffer(fileBuffer);

    if (isInfected) {
      console.warn(`[VirusScan] ⚠️  THREAT DETECTED in "${originalname}": ${viruses.join(', ')}`);
      return {
        safe: false,
        threat: 'VIRUS_DETECTED',
        reason: `Malware detected: ${viruses.join(', ')}`,
      };
    }

    console.log(`[VirusScan] ✅ Clean: "${originalname}" (${fileBuffer.length} bytes)`);
    return { safe: true };
  } catch (err) {
    console.error(`[VirusScan] Scan error for "${originalname}":`, err.message);
    // In production, fail-closed: reject the upload if scanning fails.
    // In development, fail-open: log and allow.
    if (process.env.NODE_ENV === 'production') {
      return {
        safe: false,
        threat: 'SCAN_UNAVAILABLE',
        reason: 'Virus scanning service is unavailable. Upload rejected for safety.',
      };
    }
    // Dev fallback: warn and allow
    console.warn('[VirusScan] DEV MODE: Scan service unavailable, allowing upload.');
    return { safe: true };
  }
}

// ─── Express Middleware ───────────────────────────────────────────────────────

/**
 * Express middleware to virus-scan uploaded files from multer.
 * Attach AFTER multer middleware, BEFORE the route handler.
 *
 * Checks req.file (single upload) and req.files (multiple uploads).
 *
 * @example
 *   router.post('/upload', authMiddleware, upload.single('resume'), virusScanMiddleware, handler);
 */
async function virusScanMiddleware(req, res, next) {
  const files = [];

  if (req.file) files.push(req.file);
  if (req.files) {
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else {
      // req.files is a fieldname-keyed object (multer fields() mode)
      Object.values(req.files).forEach(arr => files.push(...arr));
    }
  }

  if (files.length === 0) {
    // No files to scan — pass through
    return next();
  }

  try {
    for (const file of files) {
      const buffer = file.buffer;
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({
          error: 'INVALID_FILE',
          message: 'Uploaded file is empty.',
        });
      }

      const result = await scanBuffer(buffer, file.mimetype, file.originalname);

      if (!result.safe) {
        console.warn(`[VirusScan] Blocking upload: ${result.threat} — ${result.reason}`);
        return res.status(422).json({
          error: 'FILE_REJECTED',
          threat: result.threat,
          message: result.reason || 'Uploaded file was rejected by the security scanner.',
        });
      }
    }

    // All files passed — continue
    next();
  } catch (err) {
    console.error('[VirusScan] Middleware error:', err.message);
    res.status(500).json({
      error: 'SCAN_ERROR',
      message: 'File security check failed. Please try again.',
    });
  }
}

module.exports = {
  virusScanMiddleware,
  scanBuffer,
  validateMagicBytes,
};
