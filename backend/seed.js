const initializeDatabase = require('./init_db');
initializeDatabase()
  .then(() => {
    console.log('✅ Manual Seed Complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Manual Seed Failed:', err);
    process.exit(1);
  });
