/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        paper: '#fafaf7',
        card: '#ffffff',
        ink: '#1c1b19',
        body: '#2a2926',
        muted: '#73706a',
        faint: '#a8a49a',
        line: '#e7e4dc',
        vermilion: '#c23a22',
        vermilionDark: '#a82f1b'
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
