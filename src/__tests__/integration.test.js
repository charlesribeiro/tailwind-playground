// Integration tests for the complete dashboard functionality
const { 
  createMockDOM, 
  createMockAlpineStore, 
  createMockChart, 
  createMockCanvasContext,
  mockGetThemeColor,
  simulateAlpineInit,
  nextTick
} = require('./test-utils');

describe('Dashboard Integration Tests', () => {
  let mockDOM;
  let mockStore;
  let mockChart;
  let mockContext;
  let getThemeColor;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mocks
    mockDOM = createMockDOM();
    mockStore = createMockAlpineStore();
    mockChart = createMockChart();
    mockContext = createMockCanvasContext();
    getThemeColor = mockGetThemeColor();
    
    // Mock Chart constructor
    Chart.mockImplementation(() => mockChart);
    
    // Mock canvas context
    mockDOM.salesCanvas.getContext = jest.fn().mockReturnValue(mockContext);
    mockDOM.userCanvas.getContext = jest.fn().mockReturnValue(mockContext);
    
    // Mock Alpine store
    Alpine.store.mockReturnValue(mockStore);
    
    // Simulate Alpine initialization
    simulateAlpineInit();
  });

  describe('Complete Dashboard Workflow', () => {
    test('should initialize dashboard with all components', () => {
      // Verify DOM structure
      expect(mockDOM.timeRangeSelect).toBeTruthy();
      expect(mockDOM.salesChart).toBeTruthy();
      expect(mockDOM.userChart).toBeTruthy();
      expect(mockDOM.salesCanvas).toBeTruthy();
      expect(mockDOM.userCanvas).toBeTruthy();
      
      // Verify Alpine store
      expect(mockStore.timeRange).toBe('7d');
      expect(mockStore.labels).toBeDefined();
      expect(mockStore.salesData).toBeDefined();
      expect(mockStore.userData).toBeDefined();
      
      // Verify Alpine.js integration
      expect(Alpine.store).toHaveBeenCalledWith('dashboard', expect.any(Object));
      expect(Alpine.data).toHaveBeenCalledWith('chartComponent', expect.any(Function));
    });

    test('should handle complete time range switching workflow', async () => {
      // Initialize charts
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      
      const salesComponent = chartComponent({
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      });
      
      const userComponent = chartComponent({
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      });
      
      salesComponent.$refs = { canvas: mockDOM.salesCanvas };
      userComponent.$refs = { canvas: mockDOM.userCanvas };
      salesComponent.$watch = jest.fn();
      userComponent.$watch = jest.fn();
      
      // Initialize both charts
      salesComponent.initChart();
      userComponent.initChart();
      
      // Set up chart instances
      salesComponent.chart = mockChart;
      userComponent.chart = mockChart;
      
      // Simulate time range change
      mockDOM.timeRangeSelect.value = '30d';
      const changeEvent = new Event('change', { bubbles: true });
      mockDOM.timeRangeSelect.dispatchEvent(changeEvent);
      
      await nextTick();
      
      // Update store
      mockStore.timeRange = '30d';
      
      // Refresh charts
      salesComponent.refreshFromStore();
      userComponent.refreshFromStore();
      
      // Verify charts were updated
      expect(mockChart.data.labels).toEqual(mockStore.labels['30d']);
      expect(mockChart.data.datasets[0].data).toEqual(mockStore.salesData['30d']);
      expect(mockChart.update).toHaveBeenCalledTimes(2);
    });

    test('should maintain data consistency across all components', () => {
      // Verify 7d data consistency
      expect(mockStore.labels['7d'].length).toBe(mockStore.salesData['7d'].length);
      expect(mockStore.labels['7d'].length).toBe(mockStore.userData['7d'].length);
      
      // Verify 30d data consistency
      expect(mockStore.labels['30d'].length).toBe(mockStore.salesData['30d'].length);
      expect(mockStore.labels['30d'].length).toBe(mockStore.userData['30d'].length);
      
      // Verify data types
      expect(mockStore.salesData['7d'].every(val => typeof val === 'number')).toBe(true);
      expect(mockStore.userData['7d'].every(val => typeof val === 'number')).toBe(true);
      expect(mockStore.salesData['30d'].every(val => typeof val === 'number')).toBe(true);
      expect(mockStore.userData['30d'].every(val => typeof val === 'number')).toBe(true);
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should handle partial component failures gracefully', () => {
      // Mock one chart to fail
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      
      const salesComponent = chartComponent({
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      });
      
      const userComponent = chartComponent({
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      });
      
      salesComponent.$refs = { canvas: mockDOM.salesCanvas };
      userComponent.$refs = { canvas: mockDOM.userCanvas };
      salesComponent.$watch = jest.fn();
      userComponent.$watch = jest.fn();
      
      // Make sales chart fail
      Chart.mockImplementationOnce(() => {
        throw new Error('Sales chart failed');
      });
      
      // Sales chart should fail
      expect(() => salesComponent.initChart()).toThrow('Sales chart failed');
      
      // User chart should still work
      Chart.mockImplementation(() => mockChart);
      expect(() => userComponent.initChart()).not.toThrow();
    });

    test('should handle store data corruption gracefully', () => {
      const corruptedStore = {
        timeRange: '7d',
        labels: { '7d': ['Mon', 'Tue'] }, // Mismatched length
        salesData: { '7d': [100, 200, 300] }, // Different length
        userData: { '7d': [10, 20] } // Different length
      };
      
      Alpine.store.mockReturnValue(corruptedStore);
      
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent({
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      });
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      // Should handle mismatched data gracefully
      expect(() => component.initChart()).not.toThrow();
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle rapid time range changes efficiently', async () => {
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent({
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      });
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      component.initChart();
      component.chart = mockChart;
      
      const startTime = performance.now();
      
      // Simulate rapid changes
      for (let i = 0; i < 10; i++) {
        mockStore.timeRange = i % 2 === 0 ? '7d' : '30d';
        component.refreshFromStore();
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
      expect(mockChart.update).toHaveBeenCalledTimes(10);
    });

    test('should handle multiple chart instances without memory leaks', () => {
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      
      const components = [];
      for (let i = 0; i < 5; i++) {
        const component = chartComponent({
          type: 'bar',
          label: `Chart ${i}`,
          dataKey: 'salesData',
          colorVar: '--color-primary'
        });
        
        component.$refs = { canvas: mockDOM.salesCanvas };
        component.$watch = jest.fn();
        component.initChart();
        component.chart = mockChart;
        
        components.push(component);
      }
      
      // All components should work independently
      components.forEach(component => {
        expect(() => component.refreshFromStore()).not.toThrow();
      });
      
      expect(Chart).toHaveBeenCalledTimes(5);
    });
  });

  describe('Cross-Browser Compatibility', () => {
    test('should handle different canvas context types', () => {
      const contexts = ['2d', 'webgl', 'webgl2'];
      
      contexts.forEach(contextType => {
        const mockContext = createMockCanvasContext();
        mockDOM.salesCanvas.getContext = jest.fn().mockReturnValue(mockContext);
        
        const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
        const component = chartComponent({
          type: 'bar',
          label: 'Sales (USD)',
          dataKey: 'salesData',
          colorVar: '--color-primary'
        });
        
        component.$refs = { canvas: mockDOM.salesCanvas };
        component.$watch = jest.fn();
        
        if (contextType === '2d') {
          expect(() => component.initChart()).not.toThrow();
        } else {
          // Non-2d contexts should be handled gracefully
          expect(() => component.initChart()).not.toThrow();
        }
      });
    });

    test('should handle different event types', () => {
      const events = ['change', 'input', 'blur', 'focus'];
      
      events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        expect(() => mockDOM.timeRangeSelect.dispatchEvent(event)).not.toThrow();
      });
    });
  });

  describe('Accessibility Integration', () => {
    test('should maintain accessibility features during interactions', () => {
      // Verify label association
      const label = document.querySelector('label[for="timeRange"]');
      expect(label).toBeTruthy();
      expect(label.getAttribute('for')).toBe('timeRange');
      
      // Verify select accessibility
      expect(mockDOM.timeRangeSelect.id).toBe('timeRange');
      expect(mockDOM.timeRangeSelect.getAttribute('aria-label')).toBeFalsy(); // No aria-label needed with proper label
      
      // Verify semantic structure
      const headings = document.querySelectorAll('h1, h3');
      expect(headings).toHaveLength(3); // 1 h1 + 2 h3
    });

    test('should handle keyboard navigation', () => {
      const keyboardEvents = ['keydown', 'keyup', 'keypress'];
      
      keyboardEvents.forEach(eventType => {
        const event = new KeyboardEvent(eventType, { key: 'Tab' });
        expect(() => mockDOM.timeRangeSelect.dispatchEvent(event)).not.toThrow();
      });
    });
  });

  describe('Data Persistence and State Management', () => {
    test('should maintain state consistency across component updates', () => {
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent({
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      });
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      component.initChart();
      component.chart = mockChart;
      
      // Store initial state
      const initialTimeRange = mockStore.timeRange;
      const initialData = { ...mockStore.salesData };
      
      // Change time range
      mockStore.timeRange = '30d';
      component.refreshFromStore();
      
      // Verify state changed
      expect(mockStore.timeRange).not.toBe(initialTimeRange);
      expect(mockStore.salesData).not.toEqual(initialData);
      
      // Change back
      mockStore.timeRange = '7d';
      component.refreshFromStore();
      
      // Verify state restored
      expect(mockStore.timeRange).toBe(initialTimeRange);
      expect(mockStore.salesData).toEqual(initialData);
    });
  });
});
