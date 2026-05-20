const express = require('express');
const authMiddleware = require('../middleware/auth');
const { generateTeamSuggestion } = require('../utils/openai');

const router = express.Router();

router.post('/generate-team', authMiddleware, async (req, res) => {
  try {
    const {
      competitionDescription,
      requiredSkills = [],
      teamSize,
      preferredTechnologies = []
    } = req.body;

    if (!competitionDescription || !String(competitionDescription).trim()) {
      return res.status(400).json({ error: 'competitionDescription is required' });
    }

    const normalizedTeamSize = Math.max(2, Math.min(Number(teamSize) || 4, 8));
    const normalizedSkills = Array.isArray(requiredSkills)
      ? requiredSkills
      : String(requiredSkills || '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);
    const normalizedTech = Array.isArray(preferredTechnologies)
      ? preferredTechnologies
      : String(preferredTechnologies || '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);

    const suggestion = await generateTeamSuggestion({
      competitionDescription: String(competitionDescription).trim(),
      requiredSkills: normalizedSkills,
      teamSize: normalizedTeamSize,
      preferredTechnologies: normalizedTech
    });

    res.json({
      suggestion,
      meta: {
        teamSize: normalizedTeamSize
      }
    });
  } catch (error) {
    console.error('Generate team suggestion error:', error);
    res.status(500).json({ error: 'Failed to generate team suggestion' });
  }
});

module.exports = router;
