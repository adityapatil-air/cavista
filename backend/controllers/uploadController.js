const supabase = require('../config/supabase');
const fs = require('fs');

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const fileName = `${Date.now()}-${req.file.originalname}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype
      });

    if (error) {
      fs.unlinkSync(req.file.path);
      throw error;
    }

    fs.unlinkSync(req.file.path);

    const { data: publicURL } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    res.json({
      message: 'File uploaded successfully',
      file: {
        name: req.file.originalname,
        path: publicURL.publicUrl,
        size: req.file.size
      }
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(error);
  }
};

exports.uploadLocal = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded locally',
      file: {
        name: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size
      }
    });
  } catch (error) {
    next(error);
  }
};
