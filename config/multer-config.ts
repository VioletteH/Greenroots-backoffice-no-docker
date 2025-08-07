import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let subfolder = 'uploads';
    
        if (req.originalUrl.includes('/forests')) {
          subfolder = 'uploads/forests';
        } else if (req.originalUrl.includes('/trees')) {
          subfolder = 'uploads/trees';
        }
    
        const fullPath = path.join('public', subfolder);

        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: ((error: Error | null, acceptFile?: boolean) => void)) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); 
  } else {
      cb(new Error('Type de fichier non autorisé. Seules les images JPEG, PNG et GIF sont acceptées.'), false);
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // limit of 2 Mo
  fileFilter
});

export default upload;