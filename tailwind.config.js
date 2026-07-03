/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/client/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F5F7',
        surface: '#ffffff',
        ink: '#1F2937',
        muted: '#9CA3AF',
        soft: '#F2F2F5',
        line: '#EBEBEB',
        teal: {
          50: '#E8F5EE',
          100: '#D7ECDF',
          500: '#3DAA6C',
          600: '#3DAA6C',
          700: '#2F8D58'
        },
        amber: {
          50: '#FFF3E0',
          500: '#FF9500'
        },
        rose: {
          50: '#FFF0F0',
          500: '#FF4757'
        }
      },
      boxShadow: {
        card: '0 1px 6px rgba(0, 0, 0, 0.06)',
        float: '0 4px 20px rgba(61, 170, 108, 0.40)'
      },
      fontFamily: {
        sans: [
          '"Noto Sans SC"',
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
