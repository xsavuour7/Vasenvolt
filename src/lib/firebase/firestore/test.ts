import { populateTestData } from './test-data';

async function runTest() {
  try {
    console.log('Starting test data population...');
    await populateTestData();
    console.log('Test data population completed successfully!');
  } catch (error) {
    console.error('Error during test data population:', error);
  }
}

// Run the test
runTest(); 