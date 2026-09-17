const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidStatusTransition,
  validateCompetitionInput,
  ALLOWED_STATUS_TRANSITIONS
} = require('../services/competition.service');

test('isValidStatusTransition should strictly enforce competition status lifecycle', () => {
  // Valid transitions
  assert.equal(isValidStatusTransition('DRAFT', 'PENDING'), true);
  assert.equal(isValidStatusTransition('DRAFT', 'APPROVED'), true);
  assert.equal(isValidStatusTransition('PENDING', 'APPROVED'), true);
  assert.equal(isValidStatusTransition('APPROVED', 'ACTIVE'), true);
  assert.equal(isValidStatusTransition('ACTIVE', 'COMPLETED'), true);
  assert.equal(isValidStatusTransition('COMPLETED', 'ARCHIVED'), true);
  assert.equal(isValidStatusTransition('DRAFT', 'DRAFT'), true); // Same status is no-op

  // Invalid transitions
  assert.equal(isValidStatusTransition('COMPLETED', 'PENDING'), false);
  assert.equal(isValidStatusTransition('ARCHIVED', 'ACTIVE'), false);
  assert.equal(isValidStatusTransition('COMPLETED', 'ACTIVE'), false);
  assert.equal(isValidStatusTransition('INVALID', 'DRAFT'), false);
});

test('validateCompetitionInput should catch missing name, bad dates, and bad maxTeamSize', () => {
  // Valid input
  const validData = {
    name: 'Hackathon 2026',
    maxTeamSize: 4,
    startDate: '2026-10-01',
    endDate: '2026-10-03'
  };
  assert.deepEqual(validateCompetitionInput(validData), []);

  // Missing name
  const missingName = { maxTeamSize: 4 };
  const missingNameErrors = validateCompetitionInput(missingName);
  assert.ok(missingNameErrors.length > 0);
  assert.ok(missingNameErrors[0].includes('name is required'));

  // Invalid dates (end < start)
  const invalidDates = {
    name: 'Hackathon 2026',
    startDate: '2026-10-05',
    endDate: '2026-10-01'
  };
  const dateErrors = validateCompetitionInput(invalidDates);
  assert.ok(dateErrors.length > 0);
  assert.ok(dateErrors[0].includes('endDate cannot be before startDate'));

  // Invalid maxTeamSize
  const badTeamSize = {
    name: 'Hackathon 2026',
    maxTeamSize: -1
  };
  const teamSizeErrors = validateCompetitionInput(badTeamSize);
  assert.ok(teamSizeErrors.length > 0);
  assert.ok(teamSizeErrors[0].includes('maxTeamSize must be a number'));
});
