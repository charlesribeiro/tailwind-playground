const plugin = require('tailwindcss/plugin');

module.exports = plugin(
  function ({ matchUtilities, theme }) {
    matchUtilities(
      {
        'backdrop-blur': (value) => ({
          backdropFilter: `blur(${value})`,
        }),
      },
      { values: theme('backdropBlur') }
    );
  },
  {
    theme: {
      backdropBlur: {
        sm: '2px',
        md: '4px',
        lg: '8px',
      },
    },
  }
);
