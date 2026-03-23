import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
});

const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } }); // 8MB por archivo

router.post('/', upload.array('images', 12), async (req, res) => {
  try {
    const base = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const results = [];

    for (const f of req.files) {
      const filePath = path.join(uploadsDir, f.filename);
      const ext = path.extname(f.filename).toLowerCase() || '.jpg';
      const name = path.basename(f.filename, ext);

      // Optimize original (max 1200x1200) and overwrite file
      try {
        const buffer = await sharp(filePath).resize({ width: 1200, height: 1200, fit: 'inside' }).toBuffer();
        await fs.promises.writeFile(filePath, buffer);
      } catch (err) {
        console.warn('Could not optimize image', filePath, err.message);
      }

      // Create thumbnail (300x300 cropped)
      const thumbName = `${name}-thumb.jpg`;
      const thumbPath = path.join(uploadsDir, thumbName);
      try {
        await sharp(filePath).resize(300, 300, { fit: 'cover' }).toFile(thumbPath);
      } catch (err) {
        console.warn('Could not create thumb for', filePath, err.message);
      }

      results.push({ url: `${base}/uploads/${f.filename}`, thumb: `${base}/uploads/${thumbName}` });
    }

    return res.json({ images: results });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ message: 'Error subiendo archivos' });
  }
});

export default router;
