// // Minimal Tailwind config — adjust `content` to match files that use utility classes
module.exports = {
  content: [
    './index.html',
    './js/**/*.js',
    './styles/**/*.scss'
  ],
  theme: {
    extend: {
      borderRadius: {
        '2xl': '1.25rem'
      },
      colors: {
        colorneutral600: '#3C3B5E'
      }
    },
  },
  plugins: [],
};