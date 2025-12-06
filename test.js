const VexenDatabase = require('./database');

async function testDatabase() {
  const db = new VexenDatabase();

  try {
    // Test init
    await db.init();
    console.log('Database initialized successfully.');

    // Test getHarmony
    const harmony = await db.getHarmony('test_user');
    console.log('Harmony data:', harmony);

    // Test addHarmony
    await db.addHarmony('test_user', 5, 'from_user');
    const updatedHarmony = await db.getHarmony('test_user');
    console.log('Updated harmony:', updatedHarmony);

    // Test getUser
    const user = await db.getUser('test_user');
    console.log('User data:', user);

    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    db.close();
  }
}

testDatabase();
