// Cosine similarity calculation for skill matching

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} - Similarity score between 0 and 1
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Convert skills array to vector based on all unique skills
 * @param {Array} userSkills - User's skills
 * @param {Array} allSkills - All unique skills in the system
 * @returns {Array} - Binary vector representation
 */
function skillsToVector(userSkills, allSkills) {
  return allSkills.map(skill => userSkills.includes(skill) ? 1 : 0);
}

/**
 * Calculate match score between two users based on skills, interests, and competitions
 * @param {Object} userA - First user profile
 * @param {Object} userB - Second user profile
 * @param {Array} allSkills - All unique skills
 * @param {Array} allInterests - All unique interests
 * @param {Array} allCompetitions - All unique competitions
 * @returns {number} - Match score between 0 and 1
 */
function calculateMatchScore(userA, userB, allSkills, allInterests, allCompetitions) {
  // Convert to vectors
  const skillsVecA = skillsToVector(userA.skills || [], allSkills);
  const skillsVecB = skillsToVector(userB.skills || [], allSkills);
  
  const interestsVecA = skillsToVector(userA.interests || [], allInterests);
  const interestsVecB = skillsToVector(userB.interests || [], allInterests);
  
  const competitionsVecA = skillsToVector(userA.competitions || [], allCompetitions);
  const competitionsVecB = skillsToVector(userB.competitions || [], allCompetitions);
  
  // Calculate similarities
  const skillsSimilarity = cosineSimilarity(skillsVecA, skillsVecB);
  const interestsSimilarity = cosineSimilarity(interestsVecA, interestsVecB);
  const competitionsSimilarity = cosineSimilarity(competitionsVecA, competitionsVecB);
  
  // Weighted average (skills are most important)
  const matchScore = (
    skillsSimilarity * 0.5 +
    interestsSimilarity * 0.25 +
    competitionsSimilarity * 0.25
  );
  
  return matchScore;
}

/**
 * Find best matches for a user
 * @param {Object} currentUser - Current user profile
 * @param {Array} allUsers - All other user profiles
 * @param {number} limit - Maximum number of matches to return
 * @returns {Array} - Sorted array of matches with scores
 */
function findMatches(currentUser, allUsers, limit = 10) {
  // Get all unique values
  const allSkills = [...new Set(allUsers.flatMap(u => u.skills || []))];
  const allInterests = [...new Set(allUsers.flatMap(u => u.interests || []))];
  const allCompetitions = [...new Set(allUsers.flatMap(u => u.competitions || []))];
  
  // Calculate match scores
  const matches = allUsers
    .filter(user => user.userId !== currentUser.userId)
    .map(user => ({
      ...user,
      matchScore: calculateMatchScore(currentUser, user, allSkills, allInterests, allCompetitions)
    }))
    .filter(user => user.matchScore > 0) // Only include users with some match
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
  
  return matches;
}

module.exports = {
  cosineSimilarity,
  skillsToVector,
  calculateMatchScore,
  findMatches
};