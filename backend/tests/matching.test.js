const test = require('node:test');
const assert = require('node:assert/strict');
const {
  cosineSimilarity,
  skillsToVector,
  calculateMatchScore,
  findMatches
} = require('../utils/matching');

test('cosineSimilarity should return correct score for identical and orthogonal vectors', () => {
  const vec1 = [1, 1, 0];
  const vec2 = [1, 1, 0];
  const vec3 = [0, 0, 1];

  assert.ok(Math.abs(cosineSimilarity(vec1, vec2) - 1) < 1e-6, 'Identical vectors should have similarity ~ 1');
  assert.equal(cosineSimilarity(vec1, vec3), 0);
  assert.equal(cosineSimilarity([0, 0], [0, 0]), 0);
});

test('skillsToVector should convert skill arrays to binary vectors', () => {
  const userSkills = ['React', 'Python'];
  const allSkills = ['React', 'Node.js', 'Python', 'Docker'];

  const vector = skillsToVector(userSkills, allSkills);
  assert.deepEqual(vector, [1, 0, 1, 0]);
});

test('calculateMatchScore should compute weighted score correctly', () => {
  const userA = {
    skills: ['React', 'Node.js'],
    interests: ['AI', 'Web'],
    competitions: ['Hackathon']
  };

  const userB = {
    skills: ['React', 'Python'],
    interests: ['AI'],
    competitions: ['Hackathon']
  };

  const allSkills = ['React', 'Node.js', 'Python'];
  const allInterests = ['AI', 'Web'];
  const allCompetitions = ['Hackathon'];

  const score = calculateMatchScore(userA, userB, allSkills, allInterests, allCompetitions);
  assert.ok(score > 0 && score <= 1, 'Score should be between 0 and 1');
});

test('findMatches should rank users by match score and filter caller', () => {
  const currentUser = {
    userId: 'user-1',
    skills: ['React', 'Node.js'],
    interests: ['AI'],
    competitions: ['Hackathon']
  };

  const candidates = [
    {
      userId: 'user-1',
      skills: ['React', 'Node.js'],
      interests: ['AI'],
      competitions: ['Hackathon']
    },
    {
      userId: 'user-2',
      skills: ['React', 'Node.js'],
      interests: ['AI'],
      competitions: ['Hackathon']
    },
    {
      userId: 'user-3',
      skills: ['Python'],
      interests: ['Design'],
      competitions: ['Other']
    }
  ];

  const matches = findMatches(currentUser, candidates, 10);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].userId, 'user-2');
  assert.ok(matches[0].matchScore > 0);
});
