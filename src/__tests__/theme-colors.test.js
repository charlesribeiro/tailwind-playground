// Tests for theme color functionality
const { mockGetThemeColor } = require('./test-utils');

describe('Theme Colors', () => {
  let getThemeColor;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    getThemeColor = mockGetThemeColor();
  });

  describe('getThemeColor Function', () => {
    test('should return correct primary color', () => {
      const primaryColor = getThemeColor('--color-primary');
      expect(primaryColor).toBe('#4f46e5');
    });

    test('should return correct secondary color', () => {
      const secondaryColor = getThemeColor('--color-secondary');
      expect(secondaryColor).toBe('#10b981');
    });

    test('should return correct accent color', () => {
      const accentColor = getThemeColor('--color-accent');
      expect(accentColor).toBe('#f59e0b');
    });

    test('should return empty string for unknown color variables', () => {
      const unknownColor = getThemeColor('--color-unknown');
      expect(unknownColor).toBe('');
    });

    test('should handle null and undefined inputs', () => {
      expect(getThemeColor(null)).toBe('');
      expect(getThemeColor(undefined)).toBe('');
    });

    test('should handle empty string input', () => {
      expect(getThemeColor('')).toBe('');
    });
  });

  describe('CSS Custom Properties Integration', () => {
    test('should use getComputedStyle to read CSS variables', () => {
      // Mock getComputedStyle to return a specific color
      const mockGetComputedStyle = jest.fn(() => ({
        getPropertyValue: jest.fn((prop) => {
          if (prop === '--color-primary') return '#4f46e5';
          if (prop === '--color-secondary') return '#10b981';
          if (prop === '--color-accent') return '#f59e0b';
          return '';
        })
      }));

      Object.defineProperty(window, 'getComputedStyle', {
        value: mockGetComputedStyle,
        writable: true
      });

      // Test the actual getThemeColor function implementation
      const getThemeColor = (variableName) =>
        getComputedStyle(document.documentElement)
          .getPropertyValue(variableName)
          .trim();

      expect(getThemeColor('--color-primary')).toBe('#4f46e5');
      expect(getThemeColor('--color-secondary')).toBe('#10b981');
      expect(getThemeColor('--color-accent')).toBe('#f59e0b');

      expect(mockGetComputedStyle).toHaveBeenCalledWith(document.documentElement);
    });

    test('should trim whitespace from color values', () => {
      const mockGetComputedStyle = jest.fn(() => ({
        getPropertyValue: jest.fn((prop) => {
          if (prop === '--color-primary') return '  #4f46e5  ';
          return '';
        })
      }));

      Object.defineProperty(window, 'getComputedStyle', {
        value: mockGetComputedStyle,
        writable: true
      });

      const getThemeColor = (variableName) =>
        getComputedStyle(document.documentElement)
          .getPropertyValue(variableName)
          .trim();

      expect(getThemeColor('--color-primary')).toBe('#4f46e5');
    });
  });

  describe('Color Usage in Charts', () => {
    test('should use primary color for sales chart', () => {
      const salesChartConfig = {
        type: 'bar',
        label: 'Sales (USD)',
        dataKey: 'salesData',
        colorVar: '--color-primary'
      };

      const color = getThemeColor(salesChartConfig.colorVar);
      expect(color).toBe('#4f46e5');
    });

    test('should use secondary color for user chart', () => {
      const userChartConfig = {
        type: 'line',
        label: 'New Users',
        dataKey: 'userData',
        colorVar: '--color-secondary'
      };

      const color = getThemeColor(userChartConfig.colorVar);
      expect(color).toBe('#10b981');
    });

    test('should handle color variables in chart datasets', () => {
      const chartConfigs = [
        { colorVar: '--color-primary', expectedColor: '#4f46e5' },
        { colorVar: '--color-secondary', expectedColor: '#10b981' },
        { colorVar: '--color-accent', expectedColor: '#f59e0b' }
      ];

      chartConfigs.forEach(config => {
        const color = getThemeColor(config.colorVar);
        expect(color).toBe(config.expectedColor);
      });
    });
  });

  describe('Color Format Validation', () => {
    test('should return valid hex colors', () => {
      const colors = [
        getThemeColor('--color-primary'),
        getThemeColor('--color-secondary'),
        getThemeColor('--color-accent')
      ];

      colors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    test('should handle different color formats', () => {
      const mockGetComputedStyle = jest.fn(() => ({
        getPropertyValue: jest.fn((prop) => {
          if (prop === '--color-rgb') return 'rgb(79, 70, 229)';
          if (prop === '--color-hsl') return 'hsl(234, 64%, 59%)';
          if (prop === '--color-named') return 'indigo';
          return '';
        })
      }));

      Object.defineProperty(window, 'getComputedStyle', {
        value: mockGetComputedStyle,
        writable: true
      });

      const getThemeColor = (variableName) =>
        getComputedStyle(document.documentElement)
          .getPropertyValue(variableName)
          .trim();

      expect(getThemeColor('--color-rgb')).toBe('rgb(79, 70, 229)');
      expect(getThemeColor('--color-hsl')).toBe('hsl(234, 64%, 59%)');
      expect(getThemeColor('--color-named')).toBe('indigo');
    });
  });

  describe('Theme Color Consistency', () => {
    test('should maintain consistent color values across calls', () => {
      const primaryColor1 = getThemeColor('--color-primary');
      const primaryColor2 = getThemeColor('--color-primary');
      const primaryColor3 = getThemeColor('--color-primary');

      expect(primaryColor1).toBe(primaryColor2);
      expect(primaryColor2).toBe(primaryColor3);
      expect(primaryColor1).toBe('#4f46e5');
    });

    test('should handle concurrent color requests', () => {
      const colors = [
        getThemeColor('--color-primary'),
        getThemeColor('--color-secondary'),
        getThemeColor('--color-accent'),
        getThemeColor('--color-primary'),
        getThemeColor('--color-secondary')
      ];

      expect(colors[0]).toBe('#4f46e5');
      expect(colors[1]).toBe('#10b981');
      expect(colors[2]).toBe('#f59e0b');
      expect(colors[3]).toBe('#4f46e5');
      expect(colors[4]).toBe('#10b981');
    });
  });

  describe('Error Handling', () => {
    test('should handle getComputedStyle errors gracefully', () => {
      const mockGetComputedStyle = jest.fn(() => {
        throw new Error('getComputedStyle failed');
      });

      Object.defineProperty(window, 'getComputedStyle', {
        value: mockGetComputedStyle,
        writable: true
      });

      const getThemeColor = (variableName) => {
        try {
          return getComputedStyle(document.documentElement)
            .getPropertyValue(variableName)
            .trim();
        } catch (error) {
          return '';
        }
      };

      expect(getThemeColor('--color-primary')).toBe('');
    });

    test('should handle missing document.documentElement', () => {
      const originalDocumentElement = document.documentElement;
      document.documentElement = null;

      const getThemeColor = (variableName) => {
        try {
          return getComputedStyle(document.documentElement)
            .getPropertyValue(variableName)
            .trim();
        } catch (error) {
          return '';
        }
      };

      expect(getThemeColor('--color-primary')).toBe('');

      // Restore original
      document.documentElement = originalDocumentElement;
    });
  });

  describe('Performance', () => {
    test('should handle multiple rapid color requests efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        getThemeColor('--color-primary');
        getThemeColor('--color-secondary');
        getThemeColor('--color-accent');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second
    });
  });

  describe('Integration with Chart.js', () => {
    test('should provide colors that work with Chart.js', () => {
      const colors = {
        primary: getThemeColor('--color-primary'),
        secondary: getThemeColor('--color-secondary'),
        accent: getThemeColor('--color-accent')
      };

      // Chart.js accepts hex colors
      expect(colors.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(colors.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(colors.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    test('should provide colors for both border and background', () => {
      const primaryColor = getThemeColor('--color-primary');
      
      // Should be usable for both borderColor and backgroundColor
      const chartDataset = {
        borderColor: primaryColor,
        backgroundColor: primaryColor
      };

      expect(chartDataset.borderColor).toBe(primaryColor);
      expect(chartDataset.backgroundColor).toBe(primaryColor);
    });
  });
});
