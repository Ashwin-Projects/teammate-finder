const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { competitionDescription, generatedResponse } = req.body;

    if (!competitionDescription || !String(competitionDescription).trim()) {
      return res.status(400).json({ error: 'competitionDescription is required' });
    }

    if (!generatedResponse || typeof generatedResponse !== 'object') {
      return res.status(400).json({ error: 'generatedResponse must be a valid object' });
    }

    const saved = await prisma.savedSuggestion.create({
      data: {
        userId: req.userId,
        competitionDescription: String(competitionDescription).trim(),
        generatedResponse
      }
    });

    res.status(201).json({ message: 'Suggestion saved', suggestion: saved });
  } catch (error) {
    console.error('Save suggestion error:', error);
    res.status(500).json({ error: 'Failed to save suggestion' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const suggestions = await prisma.savedSuggestion.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

module.exports = router;
