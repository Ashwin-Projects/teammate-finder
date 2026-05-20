const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get chat history for a team
router.get('/:teamId', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check if user is a member of the team
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: req.userId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { teamId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get total count
    const totalCount = await prisma.message.count({
      where: { teamId }
    });

    res.json({
      messages,
      totalCount,
      hasMore: totalCount > parseInt(offset) + parseInt(limit)
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Delete a message (only sender or team admin)
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        team: {
          include: {
            members: true
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is sender or team admin
    const isSender = message.senderId === req.userId;
    const isAdmin = message.team.members.some(
      member => member.userId === req.userId && member.role === 'admin'
    );

    if (!isSender && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;