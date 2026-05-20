const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { generateProfileSummary } = require('../utils/openai');

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create or update profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const {
      bio,
      skills,
      interests,
      competitions,
      availability,
      experienceLevel,
      generateSummary
    } = req.body;

    // Prepare profile data
    const profileData = {
      bio,
      skills: skills || [],
      interests: interests || [],
      competitions: competitions || [],
      availability,
      experienceLevel
    };

    // Generate AI summary if requested
    if (generateSummary) {
      try {
        profileData.summary = await generateProfileSummary(profileData);
      } catch (error) {
        console.error('Failed to generate summary:', error);
        // Continue without summary
      }
    }

    // Upsert profile (create or update)
    const profile = await prisma.profile.upsert({
      where: { userId: req.userId },
      update: profileData,
      create: {
        ...profileData,
        userId: req.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get profile by user ID (public)
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Generate AI summary for existing profile
router.post('/generate-summary', authMiddleware, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const summary = await generateProfileSummary(profile);

    const updatedProfile = await prisma.profile.update({
      where: { userId: req.userId },
      data: { summary }
    });

    res.json({
      message: 'Summary generated successfully',
      summary: updatedProfile.summary
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

module.exports = router;