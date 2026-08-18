/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        paper: '#f6f1ff',
        card: '#ffffff',
        ink: '#5b4a6e',
        body: '#5b4a6e',
        muted: '#5b4a6e',
        faint: '#5b4a6e',
        line: '#8a7aa0',
        vermilion: '#5b4a6e',
        vermilionDark: '#5b4a6e',
        clayBlue: '#bde0fe',
        clayPink: '#ffd6e0',
        clayGreen: '#c8f7dc',
        clayYellow: '#fff1c9'
      },
      fontFamily: {
        serifSc: ['Songti SC', 'STSong', 'Noto Serif SC', 'Source Han Serif SC', 'SimSun', 'serif'],
        code: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace']
      },
      keyframes: {
        caretBlink: {
          '0%, 45%': { opacity: '1' },
          '50%, 95%': { opacity: '0' }
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.4', transform: 'scale(.8)' }
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' }
        }
      },
      animation: {
        caretBlink: 'caretBlink 1s step-end infinite',
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        bounceSoft: 'bounceSoft 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
