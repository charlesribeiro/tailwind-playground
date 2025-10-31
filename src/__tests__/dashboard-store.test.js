// Tests for Alpine.js dashboard store functionality
const { createMockAlpineStore, simulateAlpineInit } = require('./test-utils');

describe('Dashboard Store', () => {
  let mockStore;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockStore = createMockAlpineStore();
  });

  describe('Store Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(mockStore.timeRange).toBe('7d');
      expect(mockStore.labels).toBeDefined();
      expect(mockStore.salesData).toBeDefined();
      expect(mockStore.userData).toBeDefined();
    });

    test('should have correct structure for 7d data', () => {
      expect(mockStore.labels['7d']).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
      expect(mockStore.salesData['7d']).toEqual([1200, 900, 1500, 1100, 1700, 800, 950]);
      expect(mockStore.userData['7d']).toEqual([45, 30, 60, 50, 75, 25, 40]);
    });

    test('should have correct structure for 30d data', () => {
      expect(mockStore.labels['30d']).toEqual(['W1', 'W2', 'W3', 'W4']);
      expect(mockStore.salesData['30d']).toEqual([5200, 6100, 5800, 6400]);
      expect(mockStore.userData['30d']).toEqual([180, 210, 195, 240]);
    });
  });

  describe('Data Consistency', () => {
    test('should have same number of labels and data points for 7d', () => {
      expect(mockStore.labels['7d'].length).toBe(mockStore.salesData['7d'].length);
      expect(mockStore.labels['7d'].length).toBe(mockStore.userData['7d'].length);
    });

    test('should have same number of labels and data points for 30d', () => {
      expect(mockStore.labels['30d'].length).toBe(mockStore.salesData['30d'].length);
      expect(mockStore.labels['30d'].length).toBe(mockStore.userData['30d'].length);
    });

    test('should have valid numeric data for sales', () => {
      const salesData7d = mockStore.salesData['7d'];
      const salesData30d = mockStore.salesData['30d'];
      
      expect(salesData7d.every(val => typeof val === 'number' && val >= 0)).toBe(true);
      expect(salesData30d.every(val => typeof val === 'number' && val >= 0)).toBe(true);
    });

    test('should have valid numeric data for users', () => {
      const userData7d = mockStore.userData['7d'];
      const userData30d = mockStore.userData['30d'];
      
      expect(userData7d.every(val => typeof val === 'number' && val >= 0)).toBe(true);
      expect(userData30d.every(val => typeof val === 'number' && val >= 0)).toBe(true);
    });
  });

  describe('Time Range Switching', () => {
    test('should allow timeRange to be changed', () => {
      mockStore.timeRange = '30d';
      expect(mockStore.timeRange).toBe('30d');
    });

    test('should maintain data integrity when switching time ranges', () => {
      // Test 7d to 30d switch
      mockStore.timeRange = '30d';
      expect(mockStore.labels[mockStore.timeRange]).toBeDefined();
      expect(mockStore.salesData[mockStore.timeRange]).toBeDefined();
      expect(mockStore.userData[mockStore.timeRange]).toBeDefined();

      // Test 30d to 7d switch
      mockStore.timeRange = '7d';
      expect(mockStore.labels[mockStore.timeRange]).toBeDefined();
      expect(mockStore.salesData[mockStore.timeRange]).toBeDefined();
      expect(mockStore.userData[mockStore.timeRange]).toBeDefined();
    });
  });

  describe('Data Access Patterns', () => {
    test('should provide correct data for current time range', () => {
      // Test 7d data access
      mockStore.timeRange = '7d';
      expect(mockStore.labels[mockStore.timeRange]).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
      expect(mockStore.salesData[mockStore.timeRange]).toEqual([1200, 900, 1500, 1100, 1700, 800, 950]);
      expect(mockStore.userData[mockStore.timeRange]).toEqual([45, 30, 60, 50, 75, 25, 40]);

      // Test 30d data access
      mockStore.timeRange = '30d';
      expect(mockStore.labels[mockStore.timeRange]).toEqual(['W1', 'W2', 'W3', 'W4']);
      expect(mockStore.salesData[mockStore.timeRange]).toEqual([5200, 6100, 5800, 6400]);
      expect(mockStore.userData[mockStore.timeRange]).toEqual([180, 210, 195, 240]);
    });
  });

  describe('Store Integration', () => {
    test('should be accessible via Alpine.store', () => {
      simulateAlpineInit();
      expect(Alpine.store).toHaveBeenCalledWith('dashboard', expect.any(Object));
    });

    test('should maintain reactivity when timeRange changes', () => {
      const initialTimeRange = mockStore.timeRange;
      mockStore.timeRange = '30d';
      
      expect(mockStore.timeRange).not.toBe(initialTimeRange);
      expect(mockStore.timeRange).toBe('30d');
    });
  });

  describe('Data Validation', () => {
    test('should have non-empty labels for both time ranges', () => {
      expect(mockStore.labels['7d'].length).toBeGreaterThan(0);
      expect(mockStore.labels['30d'].length).toBeGreaterThan(0);
    });

    test('should have non-empty data arrays for both time ranges', () => {
      expect(mockStore.salesData['7d'].length).toBeGreaterThan(0);
      expect(mockStore.salesData['30d'].length).toBeGreaterThan(0);
      expect(mockStore.userData['7d'].length).toBeGreaterThan(0);
      expect(mockStore.userData['30d'].length).toBeGreaterThan(0);
    });

    test('should have reasonable data ranges', () => {
      // Sales data should be positive and reasonable
      const allSalesData = [...mockStore.salesData['7d'], ...mockStore.salesData['30d']];
      expect(allSalesData.every(val => val >= 0 && val < 100000)).toBe(true);

      // User data should be positive and reasonable
      const allUserData = [...mockStore.userData['7d'], ...mockStore.userData['30d']];
      expect(allUserData.every(val => val >= 0 && val < 10000)).toBe(true);
    });
  });
});
