const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, role: true }
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

module.exports = adminMiddleware;
