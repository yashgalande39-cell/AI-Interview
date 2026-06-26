/**
 * TRESK AI — S3 Object Storage Client
 * =====================================================================
 * Supports AWS S3, Cloudflare R2, and MinIO (all S3-compatible).
 * Handles resume PDFs, audio recordings, and user screenshots via
 * presigned URLs — keeping binary data out of PostgreSQL.
 *
 * Dependencies: @aws-sdk/client-s3, @aws-sdk/s3-request-presigner
 * Install: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 */

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────────────────────

const S3_ENABLED = process.env.S3_ENABLED === 'true';
const S3_BUCKET   = process.env.S3_BUCKET || 'tresk-ai-uploads';
const S3_REGION   = process.env.S3_REGION || 'auto';  // 'auto' for R2, 'us-east-1' for S3

/**
 * Resolve provider-specific endpoint.
 * - AWS S3: leave endpoint undefined (SDK uses default)
 * - Cloudflare R2: https://<account-id>.r2.cloudflarestorage.com
 * - MinIO (local dev): http://localhost:9000
 */
const getEndpoint = () => {
  if (process.env.S3_ENDPOINT) return process.env.S3_ENDPOINT;
  // Auto-detect Cloudflare R2 by checking account ID env var
  if (process.env.CF_ACCOUNT_ID) {
    return `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  }
  return undefined;
};

let _s3Client = null;

/**
 * Lazily initialize S3 client on first use.
 * This prevents crashing at startup if S3 env vars aren't set in dev mode.
 */
function getS3Client() {
  if (!S3_ENABLED) {
    throw new Error('S3_ENABLED is not set to "true". Object storage is disabled.');
  }
  if (_s3Client) return _s3Client;

  const accessKeyId     = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be set when S3_ENABLED=true');
  }

  const endpoint = getEndpoint();

  _s3Client = new S3Client({
    region: S3_REGION,
    credentials: { accessKeyId, secretAccessKey },
    ...(endpoint ? { endpoint, forcePathStyle: !!process.env.S3_FORCE_PATH_STYLE } : {}),
  });

  console.log(`[S3] Client initialized — bucket: ${S3_BUCKET}, endpoint: ${endpoint || 'AWS default'}`);
  return _s3Client;
}

// ─── Key Generators ──────────────────────────────────────────────────────────

/**
 * Allowed MIME types for each upload category.
 */
const ALLOWED_MIME_TYPES = {
  resume:     ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  audio:      ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg'],
  screenshot: ['image/jpeg', 'image/png', 'image/webp'],
};

/**
 * Validate content type against category whitelist.
 */
function validateContentType(category, contentType) {
  const allowed = ALLOWED_MIME_TYPES[category];
  if (!allowed) throw new Error(`Unknown upload category: ${category}`);
  if (!allowed.includes(contentType)) {
    throw new Error(`Content type "${contentType}" is not allowed for category "${category}". Allowed: ${allowed.join(', ')}`);
  }
}

/**
 * Generate a safe, unique S3 object key for a given upload type.
 * @param {string} category - 'resume' | 'audio' | 'screenshot'
 * @param {string} userId - UUID of the owner
 * @param {string} originalFilename - Original file name (sanitized)
 * @returns {string} S3 key like 'resumes/user-uuid/2024-01-15T12-00-00-abc123.pdf'
 */
function generateObjectKey(category, userId, originalFilename) {
  const ext = path.extname(originalFilename).toLowerCase().replace(/[^a-z0-9.]/g, '') || '.bin';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const randomId = crypto.randomBytes(6).toString('hex');
  const folderMap = { resume: 'resumes', audio: 'audio', screenshot: 'screenshots' };
  const folder = folderMap[category] || category;
  return `${folder}/${userId}/${timestamp}-${randomId}${ext}`;
}

// ─── Core Operations ─────────────────────────────────────────────────────────

/**
 * Upload a file buffer directly to S3.
 * Use this for server-side uploads (e.g. after parsing a resume PDF).
 *
 * @param {object} params
 * @param {string} params.category - 'resume' | 'audio' | 'screenshot'
 * @param {string} params.userId - Owner's UUID
 * @param {string} params.filename - Original file name
 * @param {Buffer|Uint8Array} params.body - File content
 * @param {string} params.contentType - MIME type
 * @returns {Promise<{key: string, bucket: string, url: string}>}
 */
async function uploadFile({ category, userId, filename, body, contentType }) {
  validateContentType(category, contentType);
  const client = getS3Client();
  const key = generateObjectKey(category, userId, filename);

  await client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    // Tag objects for lifecycle policies (e.g. auto-delete audio after 90 days)
    Tagging: `category=${category}&userId=${userId}`,
    // Server-side encryption
    ServerSideEncryption: 'AES256',
  }));

  console.log(`[S3] Uploaded ${key} (${category}, ${body.length} bytes)`);

  return {
    key,
    bucket: S3_BUCKET,
    // Public URL (only works if bucket/object is public — not recommended for user data)
    // Use presigned URLs for private access instead.
    url: `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`,
  };
}

/**
 * Generate a presigned upload URL so the frontend can upload directly to S3.
 * The server never receives the file bytes — reduces bandwidth and costs.
 *
 * @param {object} params
 * @param {string} params.category - 'resume' | 'audio' | 'screenshot'
 * @param {string} params.userId - Owner's UUID
 * @param {string} params.filename - Original file name (used to derive extension)
 * @param {string} params.contentType - MIME type (enforced server-side via presign conditions)
 * @param {number} [params.expiresIn=300] - URL validity in seconds (default 5 min)
 * @returns {Promise<{uploadUrl: string, key: string, bucket: string}>}
 */
async function getPresignedUploadUrl({ category, userId, filename, contentType, expiresIn = 300 }) {
  validateContentType(category, contentType);
  const client = getS3Client();
  const key = generateObjectKey(category, userId, filename);

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });

  console.log(`[S3] Generated presigned upload URL for ${key}, expires in ${expiresIn}s`);
  return { uploadUrl, key, bucket: S3_BUCKET };
}

/**
 * Generate a presigned download URL for secure, time-limited file retrieval.
 *
 * @param {string} key - S3 object key
 * @param {number} [expiresIn=3600] - URL validity in seconds (default 1 hour)
 * @returns {Promise<string>} Presigned download URL
 */
async function getPresignedDownloadUrl(key, expiresIn = 3600) {
  const client = getS3Client();
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Delete an object from S3.
 * Called when a user deletes their resume or account.
 *
 * @param {string} key - S3 object key to delete
 */
async function deleteObject(key) {
  const client = getS3Client();
  await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
  console.log(`[S3] Deleted object: ${key}`);
}

/**
 * Check if an object exists (HEAD request, no data transfer).
 *
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>}
 */
async function objectExists(key) {
  try {
    const client = getS3Client();
    await client.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) return false;
    throw err;
  }
}

// ─── Local Fallback (Dev Mode without S3) ───────────────────────────────────

/**
 * In development without S3, fall through to local disk or return a stub.
 * Useful for running the platform locally without any cloud credentials.
 */
function isS3Enabled() {
  return S3_ENABLED;
}

module.exports = {
  isS3Enabled,
  generateObjectKey,
  validateContentType,
  uploadFile,
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  deleteObject,
  objectExists,
  S3_BUCKET,
  ALLOWED_MIME_TYPES,
};
