const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { generateTeamSummary } = require('../utils/openai');

const router = express.Router();
const prisma = new PrismaClient();

// Get all teams for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: req.userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get specific team
router.get('/:teamId', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              },
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is a member
    const isMember = team.members.some(member => member.userId === req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    res.json({ team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Create new team
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, memberIds = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    // Create team with creator as admin
    const team = await prisma.team.create({
      data: {
        name,
        description,
        members: {
          create: [
            {
              userId: req.userId,
              role: 'admin'
            },
            ...memberIds.map(userId => ({
              userId,
              role: 'member'
            }))
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              },
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    // Generate AI summary if possible
    try {
      const summary = await generateTeamSummary(team);
      await prisma.team.update({
        where: { id: team.id },
        data: { summary }
      });
      team.summary = summary;
    } catch (error) {
      console.error('Failed to generate team summary:', error);
    }

    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Add member to team
router.post('/:teamId/members', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if requester is admin
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: req.userId
        }
      }
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only team admins can add members' });
    }

    // Check if user already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a team member' });
    }

    // Add member
    const newMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role: 'member'
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

    res.status(201).json({
      message: 'Member added successfully',
      member: newMember
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from team
router.delete('/:teamId/members/:userId', authMiddleware, async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    // Check if requester is admin or removing themselves
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

    if (membership.role !== 'admin' && req.userId !== userId) {
      return res.status(403).json({ error: 'Only admins can remove other members' });
    }

    // Remove member
    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId
        }
      }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Update team
router.put('/:teamId', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body;

    // Check if requester is admin
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: req.userId
        }
      }
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only team admins can update team details' });
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: { name, description },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Team updated successfully',
      team
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team
router.delete('/:teamId', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;

    // Check if requester is admin
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: req.userId
        }
      }
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only team admins can delete the team' });
    }

    await prisma.team.delete({
      where: { id: teamId }
    });

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

module.exports = router;