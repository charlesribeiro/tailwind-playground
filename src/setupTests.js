// Jest setup file for testing environment
require('@testing-library/jest-dom');

// Mock Chart.js
global.Chart = jest.fn().mockImplementation(() => ({
  data: {
    labels: [],
    datasets: []
  },
  config: {
    type: 'bar'
  },
  update: jest.fn(),
  destroy: jest.fn()
}));

// Mock Alpine.js
global.Alpine = {
  store: jest.fn(),
  data: jest.fn(),
  init: jest.fn()
};

// Store Alpine data functions for testing
global.AlpineDataRegistry = {};

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: jest.fn(() => ({
    getPropertyValue: jest.fn((prop) => {
      const colors = {
        '--color-primary': '#4f46e5',
        '--color-secondary': '#10b981',
        '--color-accent': '#f59e0b'
      };
      return colors[prop] || '';
    })
  }))
});

// Mock document.addEventListener
global.document.addEventListener = jest.fn();

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
