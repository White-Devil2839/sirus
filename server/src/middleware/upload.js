import multer from 'multer';

// Keep uploads in memory — we parse to text immediately and store text, not files.
const storage = multer.memoryStorage();

const ALLOWED = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/pdf',
  'text/plain',
  // audio/video → transcribed with Deepgram
  'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/x-m4a', 'audio/mp4', 'audio/webm', 'audio/ogg',
  'video/mp4', 'video/webm',
]);

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB — meeting recordings are large
  fileFilter: (req, file, cb) => {
    if (ALLOWED.has(file.mimetype) || /\.(docx|pdf|txt|mp3|wav|m4a|mp4|webm|ogg)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype || file.originalname}`));
    }
  },
});
