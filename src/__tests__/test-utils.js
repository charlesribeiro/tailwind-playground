// Test utilities for DOM manipulation and Alpine.js testing

/**
 * Creates a mock DOM environment with the dashboard HTML structure
 */
function createMockDOM() {
  // Create a mock document with the dashboard structure
  const mockHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Multi-Chart Dashboard</title>
      <style type="text/tailwindcss">
        @theme {
          --color-primary: #4f46e5;
          --color-secondary: #10b981;
          --color-accent: #f59e0b;
        }
      </style>
    </head>
    <body class="bg-gray-100">
      <div class="container mx-auto p-8">
        <h1 class="text-3xl font-bold mb-6 text-gray-900">Company Dashboard</h1>
        
        <div class="mb-6 max-w-xs" x-data>
          <label for="timeRange" class="block text-sm font-medium text-gray-700">Time Range</label>
          <select
            x-model="$store.dashboard.timeRange"
            id="timeRange"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300
                   focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                   sm:text-sm rounded-md"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            x-data="chartComponent({
              type: 'bar',
              label: 'Sales (USD)',
              dataKey: 'salesData',
              colorVar: '--color-primary'
            })"
            x-init="initChart()"
            class="bg-white p-6 rounded-lg shadow-md"
          >
            <h3 class="text-lg font-medium text-gray-800">Sales</h3>
            <div class="relative h-96 mt-4">
              <canvas x-ref="canvas"></canvas>
            </div>
          </div>

          <div
            x-data="chartComponent({
              type: 'line',
              label: 'New Users',
              dataKey: 'userData',
              colorVar: '--color-secondary'
            })"
            x-init="initChart()"
            class="bg-white p-6 rounded-lg shadow-md"
          >
            <h3 class="text-lg font-medium text-gray-800">User Signups</h3>
            <div class="relative h-96 mt-4">
              <canvas x-ref="canvas"></canvas>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Parse the HTML and set up the DOM
  document.documentElement.innerHTML = mockHTML;
  
  return {
    timeRangeSelect: document.getElementById('timeRange'),
    salesChart: document.querySelector('[x-data*="salesData"]'),
    userChart: document.querySelector('[x-data*="userData"]'),
    salesCanvas: document.querySelector('[x-data*="salesData"] canvas'),
    userCanvas: document.querySelector('[x-data*="userData"] canvas')
  };
}

/**
 * Mock Alpine.js store with dashboard data
 */
function createMockAlpineStore() {
  return {
    timeRange: '7d',
    labels: {
      '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      '30d': ['W1', 'W2', 'W3', 'W4']
    },
    salesData: {
      '7d': [1200, 900, 1500, 1100, 1700, 800, 950],
      '30d': [5200, 6100, 5800, 6400]
    },
    userData: {
      '7d': [45, 30, 60, 50, 75, 25, 40],
      '30d': [180, 210, 195, 240]
    }
  };
}

/**
 * Mock Chart.js instance
 */
function createMockChart() {
  return {
    data: {
      labels: [],
      datasets: []
    },
    config: {
      type: 'bar'
    },
    update: jest.fn(),
    destroy: jest.fn()
  };
}

/**
 * Mock getThemeColor function
 */
function mockGetThemeColor() {
  return jest.fn((variableName) => {
    const colors = {
      '--color-primary': '#4f46e5',
      '--color-secondary': '#10b981',
      '--color-accent': '#f59e0b'
    };
    return colors[variableName] || '';
  });
}

/**
 * Mock chart component function
 */
function createMockChartComponent() {
  return (config) => ({
    chart: null,
    initChart() {
      const store = Alpine.store('dashboard');
      const labels = store.labels[store.timeRange];
      const values = store[config.dataKey][store.timeRange];
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(config.colorVar)
        .trim();

      const dataset = config.type === 'line'
        ? {
            label: config.label,
            data: values,
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.3,
            fill: false
          }
        : {
            label: config.label,
            data: values,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1
          };

      const ctx = this.$refs.canvas.getContext('2d');
      this.chart = new Chart(ctx, {
        type: config.type,
        data: {
          labels,
          datasets: [dataset]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } }
        }
      });

      this.$watch('$store.dashboard.timeRange', () => this.refreshFromStore());
    },
    refreshFromStore() {
      const store = Alpine.store('dashboard');
      const labels = store.labels[store.timeRange];
      const values = store[config.dataKey][store.timeRange];
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(config.colorVar)
        .trim();

      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = values;

      if (this.chart.config.type === 'line') {
        this.chart.data.datasets[0].borderColor = color;
        this.chart.data.datasets[0].backgroundColor = color;
      } else {
        this.chart.data.datasets[0].borderColor = color;
        this.chart.data.datasets[0].backgroundColor = color;
      }

      this.chart.update();
    }
  });
}

/**
 * Simulates Alpine.js initialization
 */
function simulateAlpineInit() {
  // Mock Alpine store
  const store = createMockAlpineStore();
  Alpine.store.mockReturnValue(store);
  
  // Mock Alpine data - register the chartComponent function
  Alpine.data.mockImplementation((name, fn) => {
    if (name === 'chartComponent') {
      // Store the function in the registry for testing
      global.AlpineDataRegistry[name] = createMockChartComponent();
      return createMockChartComponent();
    }
  });
  
  // Simulate alpine:init event
  const initEvent = new Event('alpine:init');
  document.dispatchEvent(initEvent);
  
  return store;
}

/**
 * Helper to wait for next tick (useful for async operations)
 */
function nextTick() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Creates a mock canvas context
 */
function createMockCanvasContext() {
  const mockContext = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    setTransform: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    measureText: jest.fn(() => ({ width: 100 })),
    fillText: jest.fn(),
    strokeText: jest.fn()
  };
  
  return mockContext;
}

module.exports = {
  createMockDOM,
  createMockAlpineStore,
  createMockChart,
  mockGetThemeColor,
  simulateAlpineInit,
  nextTick,
  createMockCanvasContext,
  createMockChartComponent
};
