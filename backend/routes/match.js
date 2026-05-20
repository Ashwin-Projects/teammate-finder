const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { findMatches } = require('../utils/matching');

const router = express.Router();
const prisma = new PrismaClient();

// Find matching teammates
router.get('/find', authMiddleware, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get current user's profile
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: req.userId }
    });

    if (!currentProfile) {
      return res.status(404).json({ 
        error: 'Profile not found. Please create your profile first.' 
      });
    }

    // Get all other users' profiles
    const allProfiles = await prisma.profile.findMany({
      where: {
        userId: { not: req.userId }
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

    if (allProfiles.length === 0) {
      return res.json({ 
        matches: [],
        message: 'No other users found yet. Check back later!' 
      });
    }

    // Find matches using cosine similarity
    const matches = findMatches(currentProfile, allProfiles, parseInt(limit));

    res.json({
      matches: matches.map(match => ({
        userId: match.userId,
        name: match.user.name,
        email: match.user.email,
        skills: match.skills,
        interests: match.interests,
        competitions: match.competitions,
        bio: match.bio,
        summary: match.summary,
        experienceLevel: match.experienceLevel,
        availability: match.availability,
        matchScore: Math.round(match.matchScore * 100) // Convert to percentage
      })),
      count: matches.length
    });
  } catch (error) {
    console.error('Find matches error:', error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
});

// Get match details for specific user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get current user's profile
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: req.userId }
    });

    // Get target user's profile
    const targetProfile = await prisma.profile.findUnique({
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

    if (!targetProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    if (!currentProfile) {
      return res.json({ 
        profile: targetProfile,
        matchScore: null 
      });
    }

    // Calculate match score
    const allSkills = [...new Set([...(currentProfile.skills || []), ...(targetProfile.skills || [])])];
    const allInterests = [...new Set([...(currentProfile.interests || []), ...(targetProfile.interests || [])])];
    const allCompetitions = [...new Set([...(currentProfile.competitions || []), ...(targetProfile.competitions || [])])];

    const { calculateMatchScore } = require('../utils/matching');
    const matchScore = calculateMatchScore(
      currentProfile,
      targetProfile,
      allSkills,
      allInterests,
      allCompetitions
    );

    res.json({
      profile: targetProfile,
      matchScore: Math.round(matchScore * 100)
    });
  } catch (error) {
    console.error('Get match details error:', error);
    res.status(500).json({ error: 'Failed to get match details' });
  }
});

module.exports = router;