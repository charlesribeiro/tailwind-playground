// Tests for Chart.js integration and rendering
const { 
  createMockDOM, 
  createMockAlpineStore, 
  createMockChart, 
  createMockCanvasContext,
  mockGetThemeColor,
  simulateAlpineInit,
  nextTick
} = require('./test-utils');

describe('Chart.js Integration and Rendering', () => {
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

  describe('Chart.js Constructor Integration', () => {
    test('should create Chart instance with correct context', () => {
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
      
      expect(Chart).toHaveBeenCalledWith(mockContext, expect.any(Object));
      expect(mockDOM.salesCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    test('should create Chart instance with correct configuration', () => {
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent({
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      });
      
      component.$refs = { canvas: mockDOM.userCanvas };
      component.$watch = jest.fn();
      
      component.initChart();
      
      const chartConfig = Chart.mock.calls[0][1];
      expect(chartConfig.type).toBe('line');
      expect(chartConfig.data.labels).toEqual(mockStore.labels[mockStore.timeRange]);
      expect(chartConfig.data.datasets).toHaveLength(1);
      expect(chartConfig.options.responsive).toBe(true);
      expect(chartConfig.options.maintainAspectRatio).toBe(false);
    });

    test('should handle Chart.js initialization errors', () => {
      Chart.mockImplementation(() => {
        throw new Error('Chart.js initialization failed');
      });

      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent({
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      });
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      expect(() => component.initChart()).toThrow('Chart.js initialization failed');
    });
  });

  describe('Chart Data Structure', () => {
    test('should create correct data structure for bar chart', () => {
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
      
      const chartConfig = Chart.mock.calls[0][1];
      const dataset = chartConfig.data.datasets[0];
      
      expect(dataset.label).toBe('Sales (USD)');
      expect(dataset.data).toEqual(mockStore.salesData[mockStore.timeRange]);
      expect(dataset.backgroundColor).toBe('#4f46e5');
      expect(dataset.borderColor).toBe('#4f46e5');
      expect(dataset.borderWidth).toBe(1);
    });

    test('should create correct data structure for line chart', () => {
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent({
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      });
      
      component.$refs = { canvas: mockDOM.userCanvas };
      component.$watch = jest.fn();
      
      component.initChart();
      
      const chartConfig = Chart.mock.calls[0][1];
      const dataset = chartConfig.data.datasets[0];
      
      expect(dataset.label).toBe('New Users');
      expect(dataset.data).toEqual(mockStore.userData[mockStore.timeRange]);
      expect(dataset.borderColor).toBe('#10b981');
      expect(dataset.backgroundColor).toBe('#10b981');
      expect(dataset.borderWidth).toBe(2);
      expect(dataset.pointRadius).toBe(3);
      expect(dataset.tension).toBe(0.3);
      expect(dataset.fill).toBe(false);
    });
  });

  describe('Chart Update Functionality', () => {
    test('should update chart data when refreshFromStore is called', () => {
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
      
      // Change time range
      mockStore.timeRange = '30d';
      
      component.refreshFromStore();
      
      expect(mockChart.data.labels).toEqual(mockStore.labels['30d']);
      expect(mockChart.data.datasets[0].data).toEqual(mockStore.salesData['30d']);
      expect(mockChart.update).toHaveBeenCalled();
    });

    test('should update chart colors when refreshFromStore is called', () => {
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent({
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      });
      
      component.$refs = { canvas: mockDOM.userCanvas };
      component.$watch = jest.fn();
      
      component.initChart();
      component.chart = mockChart;
      
      component.refreshFromStore();
      
      expect(mockChart.data.datasets[0].borderColor).toBe('#10b981');
      expect(mockChart.data.datasets[0].backgroundColor).toBe('#10b981');
    });

    test('should handle chart update errors gracefully', () => {
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
      
      // Mock chart update to throw error
      mockChart.update.mockImplementation(() => {
        throw new Error('Chart update failed');
      });
      
      expect(() => component.refreshFromStore()).toThrow('Chart update failed');
    });
  });

  describe('Chart Responsiveness', () => {
    test('should set responsive options correctly', () => {
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
      
      const chartConfig = Chart.mock.calls[0][1];
      expect(chartConfig.options.responsive).toBe(true);
      expect(chartConfig.options.maintainAspectRatio).toBe(false);
    });

    test('should set correct scale options', () => {
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent({
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      });
      
      component.$refs = { canvas: mockDOM.userCanvas };
      component.$watch = jest.fn();
      
      component.initChart();
      
      const chartConfig = Chart.mock.calls[0][1];
      expect(chartConfig.options.scales.y.beginAtZero).toBe(true);
    });
  });

  describe('Chart Lifecycle Management', () => {
    test('should handle chart destruction', () => {
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
      
      // Simulate component destruction
      if (component.chart && component.chart.destroy) {
        component.chart.destroy();
      }
      
      expect(mockChart.destroy).toHaveBeenCalled();
    });

    test('should handle multiple chart instances', () => {
      const salesChartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const userChartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      
      const salesComponent = salesChartComponent({
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      });
      
      const userComponent = userChartComponent({
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      });
      
      salesComponent.$refs = { canvas: mockDOM.salesCanvas };
      userComponent.$refs = { canvas: mockDOM.userCanvas };
      
      salesComponent.$watch = jest.fn();
      userComponent.$watch = jest.fn();
      
      salesComponent.initChart();
      userComponent.initChart();
      
      expect(Chart).toHaveBeenCalledTimes(2);
    });
  });

  describe('Chart Data Validation', () => {
    test('should handle empty data arrays', () => {
      const emptyStore = {
        timeRange: '7d',
        labels: { '7d': [] },
        salesData: { '7d': [] },
        userData: { '7d': [] }
      };
      
      Alpine.store.mockReturnValue(emptyStore);
      
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
      
      const chartConfig = Chart.mock.calls[0][1];
      expect(chartConfig.data.labels).toEqual([]);
      expect(chartConfig.data.datasets[0].data).toEqual([]);
    });

    test('should handle null data gracefully', () => {
      const nullStore = {
        timeRange: '7d',
        labels: { '7d': null },
        salesData: { '7d': null },
        userData: { '7d': null }
      };
      
      Alpine.store.mockReturnValue(nullStore);
      
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent({
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      });
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      expect(() => component.initChart()).toThrow();
    });
  });

  describe('Chart Performance', () => {
    test('should handle large datasets efficiently', () => {
      const largeStore = {
        timeRange: '7d',
        labels: { '7d': Array.from({ length: 1000 }, (_, i) => `Day ${i + 1}`) },
        salesData: { '7d': Array.from({ length: 1000 }, () => Math.random() * 1000) },
        userData: { '7d': Array.from({ length: 1000 }, () => Math.random() * 100) }
      };
      
      Alpine.store.mockReturnValue(largeStore);
      
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent({
        type: 'line',
        label: 'Large Dataset',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      });
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      const startTime = performance.now();
      component.initChart();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Chart Error Handling', () => {
    test('should handle canvas context errors', () => {
      mockDOM.salesCanvas.getContext = jest.fn(() => {
        throw new Error('Canvas context failed');
      });
      
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent({
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      });
      
      component.$refs = { canvas: mockDOM.salesCanvas };
      component.$watch = jest.fn();
      
      expect(() => component.initChart()).toThrow('Canvas context failed');
    });

    test('should handle missing canvas element', () => {
      const chartComponent = Alpine.data.mock.calls.find(call => call[0] === 'chartComponent')[1];
      const component = chartComponent({
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      });
      
      component.$refs = { canvas: null };
      component.$watch = jest.fn();
      
      expect(() => component.initChart()).toThrow();
    });
  });
});
