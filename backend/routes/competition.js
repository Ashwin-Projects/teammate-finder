const express = require('express');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const competitionService = require('../services/competition.service');

const router = express.Router();

// List competitions (Public / Authenticated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search, limit, offset } = req.query;
    const result = await competitionService.listCompetitions({ status, search, limit, offset });
    res.json(result);
  } catch (error) {
    console.error('List competitions error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch competitions' });
  }
});

// Get competition by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const competition = await competitionService.getCompetitionById(req.params.id);
    res.json({ competition });
  } catch (error) {
    console.error('Get competition error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch competition' });
  }
});

// Create new competition (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const competition = await competitionService.createCompetition(req.body, req.userId);
    res.status(201).json({
      message: 'Competition created successfully',
      competition
    });
  } catch (error) {
    console.error('Create competition error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create competition' });
  }
});

// Update competition (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const competition = await competitionService.updateCompetition(req.params.id, req.body);
    res.json({
      message: 'Competition updated successfully',
      competition
    });
  } catch (error) {
    console.error('Update competition error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update competition' });
  }
});

// Update competition status (Admin only)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status field is required' });
    }
    const competition = await competitionService.updateCompetitionStatus(req.params.id, status);
    res.json({
      message: 'Competition status updated successfully',
      competition
    });
  } catch (error) {
    console.error('Update competition status error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update competition status' });
  }
});

module.exports = router;
