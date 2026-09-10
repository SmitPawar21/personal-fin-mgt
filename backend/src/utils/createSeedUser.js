const bcrypt = require('bcrypt');
const crypto = require('crypto');
const dbService = require('../services/dbService');
const { UserRepository } = require('../repositories');

const seedUser = async () => {
  const username = process.argv[2] || 'admin';
  const plainPassword = process.argv[3] || 'admin123';

  console.log(`Initializing DB...`);
  await dbService.initialize();

  const existingUsers = await UserRepository.find({ username });
  if (existingUsers.length > 0) {
    console.log(`User '${username}' already exists. Exiting.`);
    process.exit(0);
  }

  const saltRounds = 10;
  const password_hash = await bcrypt.hash(plainPassword, saltRounds);

  console.log(`Creating user '${username}'...`);
  await UserRepository.insert({
    username,
    password_hash,
    role: 'admin'
  }, 'system-seed');

  console.log(`User '${username}' created successfully.`);
  process.exit(0);
};

seedUser().catch(err => {
  console.error('Failed to seed user:', err);
  process.exit(1);
});
