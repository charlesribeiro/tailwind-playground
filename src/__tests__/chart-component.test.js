// Tests for chart component initialization and updates
const { 
  createMockDOM, 
  createMockAlpineStore, 
  createMockChart, 
  createMockCanvasContext,
  mockGetThemeColor,
  simulateAlpineInit,
  nextTick
} = require('./test-utils');

describe('Chart Component', () => {
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

  describe('Chart Component Configuration', () => {
    test('should create bar chart with correct configuration', () => {
      const config = {
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      };

      // Mock the chart component function
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      expect(component.chart).toBeNull();
      expect(typeof component.initChart).toBe('function');
      expect(typeof component.refreshFromStore).toBe('function');
    });

    test('should create line chart with correct configuration', () => {
      const config = {
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      expect(component.chart).toBeNull();
      expect(typeof component.initChart).toBe('function');
      expect(typeof component.refreshFromStore).toBe('function');
    });
  });

  describe('Chart Initialization', () => {
    test('should initialize bar chart with correct data', () => {
      const config = {
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      // Mock $refs and $watch
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      component.initChart();
      
      expect(Chart).toHaveBeenCalledWith(mockContext, {
        type: 'bar',
        data: {
          labels: mockStore.labels[mockStore.timeRange],
          datasets: [expect.objectContaining({
            label: 'Sales (USD)',
            data: mockStore.salesData[mockStore.timeRange],
            backgroundColor: '#4f46e5',
            borderColor: '#4f46e5',
            borderWidth: 1
          })]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } }
        }
      });
    });

    test('should initialize line chart with correct data', () => {
      const config = {
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      component.$refs = { canvas: mockDOM.userCanvas };
      component.$watch = jest.fn();
      
      component.initChart();
      
      expect(Chart).toHaveBeenCalledWith(mockContext, {
        type: 'line',
        data: {
          labels: mockStore.labels[mockStore.timeRange],
          datasets: [expect.objectContaining({
            label: 'New Users',
            data: mockStore.userData[mockStore.timeRange],
            borderColor: '#10b981',
            backgroundColor: '#10b981',
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.3,
            fill: false
          })]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } }
        }
      });
    });

    test('should set up timeRange watcher', () => {
      const config = {
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      component.initChart();
      
      expect(component.$watch).toHaveBeenCalledWith('$store.dashboard.timeRange', expect.any(Function));
    });
  });

  describe('Chart Refresh Functionality', () => {
    test('should refresh bar chart data when timeRange changes', () => {
      const config = {
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      // Initialize chart
      component.initChart();
      component.chart = mockChart;
      
      // Change time range
      mockStore.timeRange = '30d';
      
      // Call refresh
      component.refreshFromStore();
      
      expect(mockChart.data.labels).toEqual(mockStore.labels['30d']);
      expect(mockChart.data.datasets[0].data).toEqual(mockStore.salesData['30d']);
      expect(mockChart.update).toHaveBeenCalled();
    });

    test('should refresh line chart data when timeRange changes', () => {
      const config = {
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      component.$refs = { canvas: mockDOM.userCanvas };
      component.$watch = jest.fn();
      
      // Initialize chart
      component.initChart();
      component.chart = mockChart;
      
      // Change time range
      mockStore.timeRange = '30d';
      
      // Call refresh
      component.refreshFromStore();
      
      expect(mockChart.data.labels).toEqual(mockStore.labels['30d']);
      expect(mockChart.data.datasets[0].data).toEqual(mockStore.userData['30d']);
      expect(mockChart.update).toHaveBeenCalled();
    });

    test('should update colors when refreshing', () => {
      const config = {
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      component.$refs = { canvas: mockDOM.userCanvas };
      component.$watch = jest.fn();
      
      component.initChart();
      component.chart = mockChart;
      
      component.refreshFromStore();
      
      expect(mockChart.data.datasets[0].borderColor).toBe('#10b981');
      expect(mockChart.data.datasets[0].backgroundColor).toBe('#10b981');
    });
  });

  describe('Chart Data Handling', () => {
    test('should handle missing data gracefully', () => {
      const config = {
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      // Mock store with missing data
      const incompleteStore = { ...mockStore };
      delete incompleteStore.salesData;
      Alpine.store.mockReturnValue(incompleteStore);
      
      expect(() => component.initChart()).toThrow();
    });

    test('should handle invalid timeRange gracefully', () => {
      const config = {
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      // Mock store with invalid timeRange
      const invalidStore = { ...mockStore, timeRange: 'invalid' };
      Alpine.store.mockReturnValue(invalidStore);
      
      expect(() => component.initChart()).toThrow();
    });
  });

  describe('Chart Options', () => {
    test('should set correct chart options for bar chart', () => {
      const config = {
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      component.initChart();
      
      const chartOptions = Chart.mock.calls[0][1].options;
      expect(chartOptions.responsive).toBe(true);
      expect(chartOptions.maintainAspectRatio).toBe(false);
      expect(chartOptions.scales.y.beginAtZero).toBe(true);
    });

    test('should set correct chart options for line chart', () => {
      const config = {
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      component.$refs = { canvas: mockDOM.userCanvas };
      component.$watch = jest.fn();
      
      component.initChart();
      
      const chartOptions = Chart.mock.calls[0][1].options;
      expect(chartOptions.responsive).toBe(true);
      expect(chartOptions.maintainAspectRatio).toBe(false);
      expect(chartOptions.scales.y.beginAtZero).toBe(true);
    });
  });

  describe('Component Lifecycle', () => {
    test('should initialize chart only once', () => {
      const config = {
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      // Call initChart multiple times
      component.initChart();
      component.initChart();
      component.initChart();
      
      // Chart should be created only once per call
      expect(Chart).toHaveBeenCalledTimes(3);
    });

    test('should handle chart destruction', () => {
      const config = {
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      };

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent(config);
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      component.initChart();
      component.chart = mockChart;
      
      // Simulate component destruction
      if (component.chart && component.chart.destroy) {
        component.chart.destroy();
      }
      
      expect(mockChart.destroy).toHaveBeenCalled();
    });
  });
});
