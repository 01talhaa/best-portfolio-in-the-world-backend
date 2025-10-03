const express = require('express');
const router = express.Router();
const { upload, deleteFromCloudinary, extractPublicId } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/upload/single
 * @desc    Upload a single file with optional entity association
 * @access  Private
 */
router.post('/single', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Extract entity association data from request body
    const { entityType, entityId, description } = req.body;

    const responseData = {
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      format: req.file.format || req.file.mimetype.split('/')[1],
      resourceType: req.file.resource_type || 'auto'
    };

    // Add entity association if provided
    if (entityType && entityId) {
      responseData.entityAssociation = {
        type: entityType, // 'project', 'team-member', 'blog', 'service', 'client'
        id: entityId,
        description: description || null
      };
    }

    res.status(200).json({
      success: true,
      data: responseData,
      message: entityType && entityId 
        ? `File uploaded and associated with ${entityType} ${entityId}` 
        : 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files with optional entity association
 * @access  Private
 */
router.post('/multiple', protect, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    // Extract entity association data from request body
    const { entityType, entityId, description } = req.body;

    const uploadedFiles = req.files.map(file => {
      const fileData = {
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        format: file.format || file.mimetype.split('/')[1],
        resourceType: file.resource_type || 'auto'
      };

      // Add entity association if provided
      if (entityType && entityId) {
        fileData.entityAssociation = {
          type: entityType, // 'project', 'team-member', 'blog', 'service', 'client'
          id: entityId,
          description: description || null
        };
      }

      return fileData;
    });

    res.status(200).json({
      success: true,
      data: uploadedFiles,
      message: entityType && entityId 
        ? `${req.files.length} files uploaded and associated with ${entityType} ${entityId}` 
        : `${req.files.length} files uploaded successfully`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/upload/:publicId
 * @desc    Delete a file from Cloudinary
 * @access  Private
 */
router.delete('/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    const result = await deleteFromCloudinary(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'File not found or already deleted'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/upload/profile-image
 * @desc    Upload profile image for team members
 * @access  Private
 */
router.post('/profile-image', protect, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No profile image uploaded'
      });
    }

    // Ensure it's an image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        error: 'Only image files are allowed for profile images'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        profileImageUrl: req.file.path,
        publicId: req.file.filename
      },
      message: 'Profile image uploaded successfully'
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload profile image',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/upload/certificate
 * @desc    Upload certificate document
 * @access  Private
 */
router.post('/certificate', protect, upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No certificate uploaded'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        certificateUrl: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname
      },
      message: 'Certificate uploaded successfully'
    });
  } catch (error) {
    console.error('Certificate upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload certificate',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/upload/project-media
 * @desc    Upload project images/videos
 * @access  Private
 */
router.post('/project-media', protect, upload.array('media', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No media files uploaded'
      });
    }

    const mediaFiles = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      originalName: file.originalname
    }));

    res.status(200).json({
      success: true,
      data: mediaFiles,
      message: `${req.files.length} media files uploaded successfully`
    });
  } catch (error) {
    console.error('Project media upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload project media',
      details: error.message
    });
  }
});

module.exports = router;