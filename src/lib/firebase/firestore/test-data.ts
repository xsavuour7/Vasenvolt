import { Timestamp } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { Auth } from 'firebase/auth';
import { 
  UserProfile, 
  AnalyticsData, 
  Report, 
  Recommendation, 
  UserSettings 
} from './types';

// Type guard to ensure Firebase Auth is initialized
const getAuth = () => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return auth;
};

// Get the current user's ID
const getCurrentUserId = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user found');
  }
  return user.uid;
};

// Function to create test data with the current user's ID
export const createTestData = () => {
  const userId = getCurrentUserId();

  // Sample user profile
  const testUserProfile: UserProfile = {
    uid: userId,
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    lastLogin: new Date(),
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    }
  };

  // Sample analytics data
  const testAnalyticsData: AnalyticsData[] = [
    {
      id: `analytics-${userId}-1`,
      userId: userId,
      timestamp: new Date(),
      energyConsumption: 0.5,
      peakHours: ['09:00', '18:00'],
      cost: 0.15,
      deviceUsage: {
        'device-1': {
          consumption: 0.3,
          duration: 3600
        },
        'device-2': {
          consumption: 0.2,
          duration: 1800
        }
      }
    },
    {
      id: `analytics-${userId}-2`,
      userId: userId,
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      energyConsumption: 0.4,
      peakHours: ['10:00', '19:00'],
      cost: 0.12,
      deviceUsage: {
        'device-1': {
          consumption: 0.25,
          duration: 3000
        },
        'device-2': {
          consumption: 0.15,
          duration: 1500
        }
      }
    }
  ];

  // Sample report
  const testReport: Report = {
    id: `report-${userId}-1`,
    userId: userId,
    title: 'Monthly Energy Report',
    type: 'monthly',
    startDate: new Date(Date.now() - 30 * 24 * 3600000), // 30 days ago
    endDate: new Date(),
    data: testAnalyticsData,
    createdAt: new Date(),
    status: 'completed'
  };

  // Sample recommendation
  const testRecommendation: Recommendation = {
    id: `recommendation-${userId}-1`,
    userId: userId,
    type: 'energy_saving',
    title: 'Energy Saving Tip',
    description: 'Consider upgrading to energy-efficient appliances to reduce consumption.',
    impact: {
      savings: 15,
      reduction: 0.2
    },
    status: 'pending',
    createdAt: new Date()
  };

  // Sample user settings
  const testUserSettings: UserSettings = {
    userId: userId,
    notifications: {
      email: true,
      push: true,
      frequency: 'daily'
    },
    dataCollection: {
      interval: 15, // minutes
      devices: ['device-1', 'device-2']
    },
    billing: {
      plan: 'premium',
      paymentMethod: 'credit_card',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 3600000) // 30 days from now
    }
  };

  return {
    testUserProfile,
    testAnalyticsData,
    testReport,
    testRecommendation,
    testUserSettings
  };
};

// Function to populate the database with test data
export async function populateTestData() {
  try {
    // Import the service functions
    const {
      createUserProfile,
      addAnalyticsData,
      createReport,
      createRecommendation,
      updateUserSettings
    } = await import('./service');

    // Create test data with current user's ID
    const {
      testUserProfile,
      testAnalyticsData,
      testReport,
      testRecommendation,
      testUserSettings
    } = createTestData();

    console.log('Starting test data population...');
    console.log('Creating user profile...');
    await createUserProfile(testUserProfile);
    console.log('User profile created');

    console.log('Adding analytics data...');
    for (const data of testAnalyticsData) {
      console.log(`Adding analytics data with ID: ${data.id}`);
      await addAnalyticsData(data);
    }
    console.log('Analytics data added');

    console.log('Creating report...');
    await createReport(testReport);
    console.log('Report created');

    console.log('Creating recommendation...');
    await createRecommendation(testRecommendation);
    console.log('Recommendation created');

    console.log('Updating user settings...');
    await updateUserSettings(testUserSettings.userId, testUserSettings);
    console.log('User settings updated');

    console.log('Test data population completed successfully!');
  } catch (error) {
    console.error('Error populating test data:', error);
    throw error;
  }
} 