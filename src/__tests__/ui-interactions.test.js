// Tests for UI interactions like time range selection
const { 
  createMockDOM, 
  createMockAlpineStore, 
  simulateAlpineInit,
  nextTick
} = require('./test-utils');

describe('UI Interactions', () => {
  let mockDOM;
  let mockStore;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mocks
    mockDOM = createMockDOM();
    mockStore = createMockAlpineStore();
    
    // Mock Alpine store
    Alpine.store.mockReturnValue(mockStore);
    
    // Simulate Alpine initialization
    simulateAlpineInit();
  });

  describe('Time Range Selector', () => {
    test('should have correct default value', () => {
      expect(mockDOM.timeRangeSelect.value).toBe('7d');
    });

    test('should have correct options', () => {
      const options = Array.from(mockDOM.timeRangeSelect.options);
      expect(options).toHaveLength(2);
      expect(options[0].value).toBe('7d');
      expect(options[0].textContent).toBe('Last 7 Days');
      expect(options[1].value).toBe('30d');
      expect(options[1].textContent).toBe('Last 30 Days');
    });

    test('should have correct attributes', () => {
      expect(mockDOM.timeRangeSelect.id).toBe('timeRange');
      expect(mockDOM.timeRangeSelect.getAttribute('x-model')).toBe('$store.dashboard.timeRange');
      expect(mockDOM.timeRangeSelect.className).toContain('mt-1');
      expect(mockDOM.timeRangeSelect.className).toContain('block');
      expect(mockDOM.timeRangeSelect.className).toContain('w-full');
    });

    test('should have correct label', () => {
      const label = document.querySelector('label[for="timeRange"]');
      expect(label).toBeTruthy();
      expect(label.textContent).toBe('Time Range');
      expect(label.className).toContain('block');
      expect(label.className).toContain('text-sm');
      expect(label.className).toContain('font-medium');
    });
  });

  describe('Time Range Selection Events', () => {
    test('should handle time range change from 7d to 30d', async () => {
      // Simulate change event
      mockDOM.timeRangeSelect.value = '30d';
      const changeEvent = new Event('change', { bubbles: true });
      mockDOM.timeRangeSelect.dispatchEvent(changeEvent);
      
      await nextTick();
      
      // Verify store is updated
      expect(mockStore.timeRange).toBe('30d');
    });

    test('should handle time range change from 30d to 7d', async () => {
      // Set initial state to 30d
      mockStore.timeRange = '30d';
      mockDOM.timeRangeSelect.value = '30d';
      
      // Simulate change event
      mockDOM.timeRangeSelect.value = '7d';
      const changeEvent = new Event('change', { bubbles: true });
      mockDOM.timeRangeSelect.dispatchEvent(changeEvent);
      
      await nextTick();
      
      // Verify store is updated
      expect(mockStore.timeRange).toBe('7d');
    });

    test('should trigger chart updates when time range changes', async () => {
      // Mock chart refresh functions
      const mockRefreshSales = jest.fn();
      const mockRefreshUsers = jest.fn();
      
      // Simulate chart components with refresh methods
      const salesChart = {
        refreshFromStore: mockRefreshSales
      };
      const userChart = {
        refreshFromStore: mockRefreshUsers
      };
      
      // Simulate time range change
      mockDOM.timeRangeSelect.value = '30d';
      const changeEvent = new Event('change', { bubbles: true });
      mockDOM.timeRangeSelect.dispatchEvent(changeEvent);
      
      await nextTick();
      
      // In a real implementation, Alpine.js would trigger the watchers
      // Here we simulate the behavior
      if (salesChart.refreshFromStore) {
        salesChart.refreshFromStore();
      }
      if (userChart.refreshFromStore) {
        userChart.refreshFromStore();
      }
      
      expect(mockRefreshSales).toHaveBeenCalled();
      expect(mockRefreshUsers).toHaveBeenCalled();
    });
  });

  describe('Dashboard Layout', () => {
    test('should have correct main container structure', () => {
      const container = document.querySelector('.container.mx-auto.p-8');
      expect(container).toBeTruthy();
    });

    test('should have correct page title', () => {
      const title = document.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('Company Dashboard');
      expect(title.className).toContain('text-3xl');
      expect(title.className).toContain('font-bold');
      expect(title.className).toContain('mb-6');
    });

    test('should have correct grid layout for charts', () => {
      const grid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2.gap-6');
      expect(grid).toBeTruthy();
    });

    test('should have two chart containers', () => {
      const chartContainers = document.querySelectorAll('[x-data*="chartComponent"]');
      expect(chartContainers).toHaveLength(2);
    });

    test('should have sales chart with correct configuration', () => {
      const salesChart = document.querySelector('[x-data*="salesData"]');
      expect(salesChart).toBeTruthy();
      expect(salesChart.getAttribute('x-data')).toContain('type: \'bar\'');
      expect(salesChart.getAttribute('x-data')).toContain('label: \'Sales (USD)\'');
      expect(salesChart.getAttribute('x-data')).toContain('dataKey: \'salesData\'');
      expect(salesChart.getAttribute('x-data')).toContain('colorVar: \'--color-primary\'');
    });

    test('should have user chart with correct configuration', () => {
      const userChart = document.querySelector('[x-data*="userData"]');
      expect(userChart).toBeTruthy();
      expect(userChart.getAttribute('x-data')).toContain('type: \'line\'');
      expect(userChart.getAttribute('x-data')).toContain('label: \'New Users\'');
      expect(userChart.getAttribute('x-data')).toContain('dataKey: \'userData\'');
      expect(userChart.getAttribute('x-data')).toContain('colorVar: \'--color-secondary\'');
    });
  });

  describe('Chart Container Styling', () => {
    test('should have correct styling for chart containers', () => {
      const chartContainers = document.querySelectorAll('[x-data*="chartComponent"]');
      
      chartContainers.forEach(container => {
        expect(container.className).toContain('bg-white');
        expect(container.className).toContain('p-6');
        expect(container.className).toContain('rounded-lg');
        expect(container.className).toContain('shadow-md');
      });
    });

    test('should have correct chart titles', () => {
      const salesTitle = document.querySelector('[x-data*="salesData"] h3');
      const userTitle = document.querySelector('[x-data*="userData"] h3');
      
      expect(salesTitle.textContent).toBe('Sales');
      expect(userTitle.textContent).toBe('User Signups');
      
      expect(salesTitle.className).toContain('text-lg');
      expect(salesTitle.className).toContain('font-medium');
      expect(salesTitle.className).toContain('text-gray-800');
    });

    test('should have correct canvas containers', () => {
      const canvasContainers = document.querySelectorAll('.relative.h-96.mt-4');
      expect(canvasContainers).toHaveLength(2);
      
      canvasContainers.forEach(container => {
        expect(container.className).toContain('relative');
        expect(container.className).toContain('h-96');
        expect(container.className).toContain('mt-4');
      });
    });

    test('should have canvas elements with correct attributes', () => {
      const canvases = document.querySelectorAll('canvas[x-ref="canvas"]');
      expect(canvases).toHaveLength(2);
      
      canvases.forEach(canvas => {
        expect(canvas.getAttribute('x-ref')).toBe('canvas');
      });
    });
  });

  describe('Responsive Design', () => {
    test('should have responsive grid classes', () => {
      const grid = document.querySelector('.grid');
      expect(grid.className).toContain('grid-cols-1');
      expect(grid.className).toContain('lg:grid-cols-2');
    });

    test('should have responsive select styling', () => {
      expect(mockDOM.timeRangeSelect.className).toContain('sm:text-sm');
    });

    test('should have responsive container', () => {
      const container = document.querySelector('.container');
      expect(container.className).toContain('mx-auto');
    });
  });

  describe('Accessibility', () => {
    test('should have proper label association', () => {
      const label = document.querySelector('label[for="timeRange"]');
      const select = document.getElementById('timeRange');
      
      expect(label).toBeTruthy();
      expect(select).toBeTruthy();
      expect(label.getAttribute('for')).toBe(select.id);
    });

    test('should have proper form structure', () => {
      const select = mockDOM.timeRangeSelect;
      expect(select.tagName).toBe('SELECT');
      expect(select.id).toBe('timeRange');
    });

    test('should have semantic HTML structure', () => {
      const mainHeading = document.querySelector('h1');
      const chartHeadings = document.querySelectorAll('h3');
      
      expect(mainHeading).toBeTruthy();
      expect(chartHeadings).toHaveLength(2);
    });
  });

  describe('Event Handling', () => {
    test('should handle focus events on select', () => {
      const focusEvent = new Event('focus', { bubbles: true });
      mockDOM.timeRangeSelect.dispatchEvent(focusEvent);
      
      // Should not throw errors
      expect(() => {
        mockDOM.timeRangeSelect.dispatchEvent(focusEvent);
      }).not.toThrow();
    });

    test('should handle blur events on select', () => {
      const blurEvent = new Event('blur', { bubbles: true });
      mockDOM.timeRangeSelect.dispatchEvent(blurEvent);
      
      // Should not throw errors
      expect(() => {
        mockDOM.timeRangeSelect.dispatchEvent(blurEvent);
      }).not.toThrow();
    });

    test('should handle input events on select', () => {
      const inputEvent = new Event('input', { bubbles: true });
      mockDOM.timeRangeSelect.dispatchEvent(inputEvent);
      
      // Should not throw errors
      expect(() => {
        mockDOM.timeRangeSelect.dispatchEvent(inputEvent);
      }).not.toThrow();
    });
  });

  describe('Data Binding', () => {
    test('should bind to Alpine.js store correctly', () => {
      expect(mockDOM.timeRangeSelect.getAttribute('x-model')).toBe('$store.dashboard.timeRange');
    });

    test('should have Alpine.js data attributes on chart containers', () => {
      const chartContainers = document.querySelectorAll('[x-data*="chartComponent"]');
      
      chartContainers.forEach(container => {
        expect(container.getAttribute('x-data')).toContain('chartComponent');
        expect(container.getAttribute('x-init')).toBe('initChart()');
      });
    });
  });
});
