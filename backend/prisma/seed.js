const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const password = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      passwordHash: password,
      profile: {
        create: {
          bio: 'Passionate about AI and machine learning. Love participating in hackathons!',
          skills: ['Python', 'Machine Learning', 'React', 'Data Science'],
          interests: ['AI', 'Web Development', 'Data Analysis'],
          competitions: ['Hackathons', 'Data Science Competitions', 'AI Challenges'],
          experienceLevel: 'advanced',
          availability: 'Weekends',
          summary: 'AI enthusiast with strong Python and ML skills, ready to tackle challenging competitions.'
        }
      }
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      passwordHash: password,
      profile: {
        create: {
          bio: 'Full-stack developer with a passion for building scalable applications.',
          skills: ['JavaScript', 'Node.js', 'React', 'Python', 'Web Development'],
          interests: ['Web Development', 'Cloud Computing', 'DevOps'],
          competitions: ['Hackathons', 'Coding Competitions'],
          experienceLevel: 'intermediate',
          availability: 'Evenings and Weekends',
          summary: 'Versatile full-stack developer experienced in modern web technologies.'
        }
      }
    }
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'carol@example.com',
      name: 'Carol Davis',
      passwordHash: password,
      profile: {
        create: {
          bio: 'UI/UX designer who codes. I love creating beautiful and functional interfaces.',
          skills: ['UI/UX Design', 'JavaScript', 'React', 'Problem Solving'],
          interests: ['Design', 'Frontend Development', 'User Experience'],
          competitions: ['Design Challenges', 'Hackathons'],
          experienceLevel: 'intermediate',
          availability: 'Flexible',
          summary: 'Creative designer with frontend development skills, focused on user-centered design.'
        }
      }
    }
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'david@example.com',
      name: 'David Lee',
      passwordHash: password,
      profile: {
        create: {
          bio: 'Cybersecurity enthusiast and competitive programmer.',
          skills: ['C++', 'Python', 'Cybersecurity', 'Algorithms', 'Problem Solving'],
          interests: ['Security', 'Competitive Programming', 'Cryptography'],
          competitions: ['CTF', 'Coding Competitions', 'Cybersecurity'],
          experienceLevel: 'expert',
          availability: 'Weekends',
          summary: 'Expert problem solver specializing in algorithms and cybersecurity challenges.'
        }
      }
    }
  });

  const user5 = await prisma.user.create({
    data: {
      email: 'emma@example.com',
      name: 'Emma Wilson',
      passwordHash: password,
      profile: {
        create: {
          bio: 'Data scientist passionate about solving real-world problems with data.',
          skills: ['Python', 'Data Science', 'Machine Learning', 'Problem Solving'],
          interests: ['Data Analysis', 'AI', 'Statistics'],
          competitions: ['Data Science Competitions', 'AI Challenges', 'Hackathons'],
          experienceLevel: 'advanced',
          availability: 'Evenings',
          summary: 'Data scientist with expertise in ML and statistical analysis for competitions.'
        }
      }
    }
  });

  // Create a sample team
  const team = await prisma.team.create({
    data: {
      name: 'AI Innovators',
      description: 'A team focused on AI and machine learning competitions',
      summary: 'Talented group combining AI expertise with full-stack development skills.',
      members: {
        create: [
          {
            userId: user1.id,
            role: 'admin'
          },
          {
            userId: user2.id,
            role: 'member'
          },
          {
            userId: user5.id,
            role: 'member'
          }
        ]
      }
    }
  });

  // Create sample messages
  await prisma.message.createMany({
    data: [
      {
        teamId: team.id,
        senderId: user1.id,
        content: 'Hey team! Excited to work with you all on the upcoming hackathon!'
      },
      {
        teamId: team.id,
        senderId: user2.id,
        content: 'Same here! I can handle the backend and API development.'
      },
      {
        teamId: team.id,
        senderId: user5.id,
        content: 'Great! I\'ll focus on the ML model and data analysis.'
      },
      {
        teamId: team.id,
        senderId: user1.id,
        content: 'Perfect! Let\'s schedule a kickoff meeting this weekend.'
      }
    ]
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📧 Sample user credentials:');
  console.log('Email: alice@example.com | Password: password123');
  console.log('Email: bob@example.com | Password: password123');
  console.log('Email: carol@example.com | Password: password123');
  console.log('Email: david@example.com | Password: password123');
  console.log('Email: emma@example.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });