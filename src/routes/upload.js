const express = require('express');
const router = express.Router();
const { upload, deleteFromCloudinary, extractPublicId } = require('../config/cloudinary');

// Import models for entity association
const Project = require('../models/Project');
const TeamMember = require('../models/TeamMember');
const Service = require('../models/Service');
const Client = require('../models/Client');
const Blog = require('../models/Blog');

/**
 * @route   POST /api/upload/single
 * @desc    Upload a single file with optional entity association
 * @access  Public
 */
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Extract entity association data from request body
    const { entityType, entityId, description, imageType = 'gallery' } = req.body;

    const responseData = {
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      format: req.file.format || req.file.mimetype.split('/')[1],
      resourceType: req.file.resource_type || 'auto'
    };

    // If entity association is provided, update the entity in database
    if (entityType && entityId) {
      const imageUrl = req.file.path;
      let entity = null;
      let updateResult = null;

      try {
        switch (entityType.toLowerCase()) {
          case 'project':
            entity = await Project.findById(entityId);
            if (entity) {
              if (imageType === 'thumbnail') {
                updateResult = await Project.findByIdAndUpdate(
                  entityId,
                  { thumbnail: imageUrl },
                  { new: true }
                );
              } else {
                updateResult = await Project.findByIdAndUpdate(
                  entityId,
                  { $addToSet: { images: imageUrl } },
                  { new: true }
                );
              }
            }
            break;

          case 'team-member':
            entity = await TeamMember.findById(entityId);
            if (entity) {
              updateResult = await TeamMember.findByIdAndUpdate(
                entityId,
                { profileImage: imageUrl },
                { new: true }
              );
            }
            break;

          case 'service':
            entity = await Service.findById(entityId);
            if (entity) {
              if (imageType === 'icon') {
                updateResult = await Service.findByIdAndUpdate(
                  entityId,
                  { icon: imageUrl },
                  { new: true }
                );
              } else {
                updateResult = await Service.findByIdAndUpdate(
                  entityId,
                  { $addToSet: { images: imageUrl } },
                  { new: true }
                );
              }
            }
            break;

          case 'client':
            entity = await Client.findById(entityId);
            if (entity) {
              updateResult = await Client.findByIdAndUpdate(
                entityId,
                { logo: imageUrl },
                { new: true }
              );
            }
            break;

          case 'blog':
            entity = await Blog.findById(entityId);
            if (entity && entity.images) {
              updateResult = await Blog.findByIdAndUpdate(
                entityId,
                { $addToSet: { images: imageUrl } },
                { new: true }
              );
            }
            break;

          default:
            throw new Error(`Unsupported entity type: ${entityType}`);
        }

        if (!entity) {
          return res.status(404).json({
            success: false,
            error: `${entityType} with ID ${entityId} not found`
          });
        }

        responseData.entityAssociation = {
          type: entityType,
          id: entityId,
          description: description || null,
          imageType: imageType,
          updated: updateResult ? true : false
        };

      } catch (dbError) {
        console.error('Database update error:', dbError);
        // Still return success for upload, but indicate DB issue
        responseData.entityAssociation = {
          type: entityType,
          id: entityId,
          description: description || null,
          imageType: imageType,
          updated: false,
          error: dbError.message
        };
      }
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
 * @access  Public
 */
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    // Extract entity association data from request body
    const { entityType, entityId, description } = req.body;
    
    const uploadedFiles = [];
    const imageUrls = req.files.map(file => file.path);

    // Process each file
    for (const file of req.files) {
      const fileData = {
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        format: file.format || file.mimetype.split('/')[1],
        resourceType: file.resource_type || 'auto'
      };

      uploadedFiles.push(fileData);
    }

    // If entity association is provided, update the entity in database
    if (entityType && entityId) {
      let entity = null;
      let updateResult = null;

      try {
        switch (entityType.toLowerCase()) {
          case 'project':
            entity = await Project.findById(entityId);
            if (entity) {
              updateResult = await Project.findByIdAndUpdate(
                entityId,
                { $addToSet: { images: { $each: imageUrls } } },
                { new: true }
              );
            }
            break;

          case 'service':
            entity = await Service.findById(entityId);
            if (entity) {
              updateResult = await Service.findByIdAndUpdate(
                entityId,
                { $addToSet: { images: { $each: imageUrls } } },
                { new: true }
              );
            }
            break;

          case 'blog':
            entity = await Blog.findById(entityId);
            if (entity && entity.images) {
              updateResult = await Blog.findByIdAndUpdate(
                entityId,
                { $addToSet: { images: { $each: imageUrls } } },
                { new: true }
              );
            }
            break;

          default:
            throw new Error(`Multiple upload not supported for entity type: ${entityType}`);
        }

        if (!entity) {
          return res.status(404).json({
            success: false,
            error: `${entityType} with ID ${entityId} not found`
          });
        }

        // Add association info to each file
        uploadedFiles.forEach(fileData => {
          fileData.entityAssociation = {
            type: entityType,
            id: entityId,
            description: description || null,
            updated: updateResult ? true : false
          };
        });

      } catch (dbError) {
        console.error('Database update error:', dbError);
        // Still return success for upload, but indicate DB issue
        uploadedFiles.forEach(fileData => {
          fileData.entityAssociation = {
            type: entityType,
            id: entityId,
            description: description || null,
            updated: false,
            error: dbError.message
          };
        });
      }
    }

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
 * @access  Public
 */
router.delete('/:publicId', async (req, res) => {
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
 * @access  Public
 */
router.post('/profile-image', upload.single('profileImage'), async (req, res) => {
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
 * @access  Public
 */
router.post('/certificate', upload.single('certificate'), async (req, res) => {
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
 * @access  Public
 */
router.post('/project-media', upload.array('media', 5), async (req, res) => {
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