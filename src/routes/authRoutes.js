const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  uploadPhoto,
  logout
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Multer config for photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpg, png, gif, webp)'));
    }
  }
});

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/uploadphoto', protect, upload.single('photo'), uploadPhoto);

module.exports = router;

