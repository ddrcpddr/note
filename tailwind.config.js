/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/client/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fcfaf6',
        surface: '#ffffff',
        ink: '#17191c',
        muted: '#747982',
        soft: '#f3f5f1',
        line: '#e7e2d9',
        teal: {
          50: '#edf7f3',
          100: '#dcefea',
          500: '#0f8f80',
          600: '#0a7f73',
          700: '#086a60'
        },
        amber: {
          50: '#fff4e6',
          500: '#d17800'
        },
        rose: {
          50: '#fff0f0',
          500: '#f02b2b'
        }
      },
      boxShadow: {
        card: '0 8px 24px rgba(39, 43, 48, 0.08)',
        float: '0 14px 30px rgba(10, 127, 115, 0.28)'
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Microsoft YaHei"',
          'sans-serif'
        ]
      }
    }
  },
  plugins: []
};
