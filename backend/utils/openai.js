const OpenAI = require('openai');

let openai = null;
const openRouterClient = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
    })
  : null;

// Initialize OpenAI only if API key is provided
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * Generate a summary of user profile using GPT
 * @param {Object} profile - User profile data
 * @returns {Promise<string>} - Generated summary
 */
async function generateProfileSummary(profile) {
  if (!openai) {
    // Return a simple summary if OpenAI is not configured
    const skills = profile.skills?.join(', ') || 'various skills';
    const interests = profile.interests?.join(', ') || 'multiple interests';
    return `Skilled in ${skills}. Interested in ${interests}.`;
  }

  try {
    const prompt = `Create a brief, engaging 2-sentence professional summary for a competition teammate profile with the following details:
    
Skills: ${profile.skills?.join(', ') || 'Not specified'}
Interests: ${profile.interests?.join(', ') || 'Not specified'}
Competitions: ${profile.competitions?.join(', ') || 'Not specified'}
Bio: ${profile.bio || 'Not provided'}

Make it concise, professional, and highlight their strengths.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that creates professional profile summaries.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating profile summary:', error.message);
    // Fallback to simple summary
    const skills = profile.skills?.join(', ') || 'various skills';
    return `Skilled in ${skills} and ready to collaborate.`;
  }
}

/**
 * Generate a team description using GPT
 * @param {Object} team - Team data with members
 * @returns {Promise<string>} - Generated team description
 */
async function generateTeamSummary(team) {
  if (!openai) {
    return `${team.name}: A collaborative team working together on competitions.`;
  }

  try {
    const memberSkills = team.members?.map(m => m.user?.profile?.skills || []).flat() || [];
    const uniqueSkills = [...new Set(memberSkills)];

    const prompt = `Create a brief, inspiring 2-sentence team description for:
    
Team Name: ${team.name}
Team Description: ${team.description || 'Not provided'}
Combined Skills: ${uniqueSkills.join(', ') || 'Various skills'}
Number of Members: ${team.members?.length || 0}

Make it motivating and highlight the team's potential.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that creates inspiring team descriptions.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating team summary:', error.message);
    return `${team.name}: A collaborative team working together on competitions.`;
  }
}

module.exports = {
  generateProfileSummary,
  generateTeamSummary,
  generateTeamSuggestion
};

function getFallbackTeamSuggestion(input) {
  const normalizedSkills = Array.isArray(input.requiredSkills) ? input.requiredSkills : [];
  const normalizedTech = Array.isArray(input.preferredTechnologies) ? input.preferredTechnologies : [];
  const teamSize = Number(input.teamSize) || 4;
  const coreRoles = [
    'Project Lead',
    'Frontend Developer',
    'Backend Developer',
    'AI/ML Engineer',
    'QA & Demo Specialist'
  ].slice(0, Math.max(2, Math.min(teamSize, 8)));

  return {
    recommendedRoles: coreRoles.map((role) => ({
      role,
      focus: `Own ${role.toLowerCase()} responsibilities aligned to competition goals.`
    })),
    skillDistribution: normalizedSkills.length
      ? normalizedSkills.map((skill) => ({
          skill,
          priority: 'High'
        }))
      : [{ skill: 'Communication and collaboration', priority: 'High' }],
    teamStrategySuggestions: [
      'Start with a scoped MVP in 24-48 hours, then iterate based on judging criteria.',
      'Run daily check-ins and maintain a visible task board to reduce execution risk.',
      'Prepare a short, metrics-driven final demo narrative.'
    ],
    projectIdeaSuggestions: normalizedTech.length
      ? [`Build a ${normalizedTech.join(' + ')} solution for the challenge brief.`]
      : ['Build an impact-focused solution that demonstrates clear user value quickly.']
  };
}

async function generateTeamSuggestion(input) {
  if (!openRouterClient) {
    return getFallbackTeamSuggestion(input);
  }

  const teamSize = Math.max(2, Math.min(Number(input.teamSize) || 4, 8));
  const prompt = `
You are an expert hackathon team architect.
Return ONLY valid minified JSON with this exact shape:
{
  "recommendedRoles":[{"role":"string","focus":"string"}],
  "skillDistribution":[{"skill":"string","priority":"High|Medium|Low"}],
  "teamStrategySuggestions":["string"],
  "projectIdeaSuggestions":["string"]
}

User inputs:
- Competition Description: ${input.competitionDescription}
- Required Skills: ${(input.requiredSkills || []).join(', ') || 'Not specified'}
- Team Size: ${teamSize}
- Preferred Technologies: ${(input.preferredTechnologies || []).join(', ') || 'Not specified'}

Requirements:
- recommendedRoles length should be close to team size.
- Suggestions must be practical for competitions.
- Do not include markdown fences or extra text.
`.trim();

  try {
    const response = await openRouterClient.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [
        {
          role: 'system',
          content: 'You output strict JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 700
    });

    const raw = response?.choices?.[0]?.message?.content || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      recommendedRoles: Array.isArray(parsed.recommendedRoles) ? parsed.recommendedRoles : [],
      skillDistribution: Array.isArray(parsed.skillDistribution) ? parsed.skillDistribution : [],
      teamStrategySuggestions: Array.isArray(parsed.teamStrategySuggestions) ? parsed.teamStrategySuggestions : [],
      projectIdeaSuggestions: Array.isArray(parsed.projectIdeaSuggestions) ? parsed.projectIdeaSuggestions : []
    };
  } catch (error) {
    console.error('Error generating team suggestion:', error.message);
    return getFallbackTeamSuggestion(input);
  }
}