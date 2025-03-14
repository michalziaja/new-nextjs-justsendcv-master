/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... existing config ...
  theme: {
    extend: {
      // ... other extensions ...
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        shine: 'shine 2s infinite'
      },
      scale: {
        '102': '1.02',
        '105': '1.05'
      }
    }
  }
  // ... rest of config ...
} 