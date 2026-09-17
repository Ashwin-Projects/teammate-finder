const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ALLOWED_STATUS_TRANSITIONS = {
  DRAFT: ['PENDING', 'APPROVED', 'ARCHIVED'],
  PENDING: ['APPROVED', 'DRAFT', 'ARCHIVED'],
  APPROVED: ['ACTIVE', 'DRAFT', 'ARCHIVED'],
  ACTIVE: ['COMPLETED', 'ARCHIVED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: ['DRAFT']
};

/**
 * Validate status transition according to lifecycle rules
 */
function isValidStatusTransition(currentStatus, newStatus) {
  if (!currentStatus || !newStatus) return false;
  if (currentStatus === newStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  return Boolean(allowed && allowed.includes(newStatus));
}

/**
 * Validate input fields for creating or updating a competition
 */
function validateCompetitionInput(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      errors.push('Competition name is required and must be a non-empty string');
    }
  }

  if (data.maxTeamSize !== undefined) {
    const size = Number(data.maxTeamSize);
    if (isNaN(size) || size < 1 || size > 50) {
      errors.push('maxTeamSize must be a number between 1 and 50');
    }
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (isNaN(start.getTime())) {
      errors.push('startDate must be a valid date');
    }
    if (isNaN(end.getTime())) {
      errors.push('endDate must be a valid date');
    }
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
      errors.push('endDate cannot be before startDate');
    }
  }

  return errors;
}

/**
 * Create a new competition entry (Admin or Organizer)
 */
async function createCompetition(data, creatorUserId) {
  const validationErrors = validateCompetitionInput(data);
  if (validationErrors.length > 0) {
    const err = new Error(validationErrors.join('; '));
    err.statusCode = 400;
    throw err;
  }

  const {
    name,
    description,
    organizer,
    startDate,
    endDate,
    maxTeamSize,
    requiredSkills,
    status
  } = data;

  const initialStatus = status && ALLOWED_STATUS_TRANSITIONS.DRAFT.includes(status) ? status : 'DRAFT';

  const competition = await prisma.competition.create({
    data: {
      name: name.trim(),
      description: description ? description.trim() : null,
      organizer: organizer ? organizer.trim() : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      maxTeamSize: maxTeamSize ? Number(maxTeamSize) : 4,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      status: initialStatus,
      createdByUserId: creatorUserId || null
    }
  });

  return competition;
}

/**
 * List competitions with optional status and search filter
 */
async function listCompetitions(filters = {}) {
  const { status, search, limit = 20, offset = 0 } = filters;
  const where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { organizer: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [competitions, total] = await Promise.all([
    prisma.competition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
      include: {
        _count: {
          select: {
            teams: true,
            members: true
          }
        }
      }
    }),
    prisma.competition.count({ where })
  ]);

  return { competitions, total };
}

/**
 * Get single competition details
 */
async function getCompetitionById(id) {
  const competition = await prisma.competition.findUnique({
    where: { id },
    include: {
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          teams: true,
          members: true
        }
      }
    }
  });

  if (!competition) {
    const err = new Error('Competition not found');
    err.statusCode = 404;
    throw err;
  }

  return competition;
}

/**
 * Update competition details and/or status with lifecycle validation
 */
async function updateCompetition(id, data) {
  const existing = await getCompetitionById(id);

  const validationErrors = validateCompetitionInput(data, true);
  if (validationErrors.length > 0) {
    const err = new Error(validationErrors.join('; '));
    err.statusCode = 400;
    throw err;
  }

  if (data.status && data.status !== existing.status) {
    if (!isValidStatusTransition(existing.status, data.status)) {
      const err = new Error(`Invalid status transition from ${existing.status} to ${data.status}`);
      err.statusCode = 400;
      throw err;
    }
  }

  const updateFields = {};
  if (data.name !== undefined) updateFields.name = data.name.trim();
  if (data.description !== undefined) updateFields.description = data.description ? data.description.trim() : null;
  if (data.organizer !== undefined) updateFields.organizer = data.organizer ? data.organizer.trim() : null;
  if (data.startDate !== undefined) updateFields.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updateFields.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.maxTeamSize !== undefined) updateFields.maxTeamSize = Number(data.maxTeamSize);
  if (data.requiredSkills !== undefined) updateFields.requiredSkills = Array.isArray(data.requiredSkills) ? data.requiredSkills : [];
  if (data.status !== undefined) updateFields.status = data.status;

  const updated = await prisma.competition.update({
    where: { id },
    data: updateFields
  });

  return updated;
}

/**
 * Update competition status helper
 */
async function updateCompetitionStatus(id, newStatus) {
  return updateCompetition(id, { status: newStatus });
}

module.exports = {
  ALLOWED_STATUS_TRANSITIONS,
  isValidStatusTransition,
  validateCompetitionInput,
  createCompetition,
  listCompetitions,
  getCompetitionById,
  updateCompetition,
  updateCompetitionStatus
};
