const multer = require('multer');
const path   = require('path');
const { v4: uuidv4 } = require('uuid');
const fs     = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // FIX: honour the explicit folder set on req (e.g. by reels route),
    //      then fall back to the query-string, then 'general'.
    const folder = req._uploadFolder || req.query.folder || 'general';
    const uploadPath = path.join(__dirname, '../../uploads', folder);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg|mp4|mov|avi|pdf/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('File type not allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

module.exports = upload;
