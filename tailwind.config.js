/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.html',
    './admin/**/*.html',
    './components/**/*.html',
    './assets/js/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        footer: '#030C09',
        uap: {
          blue: '#002B49',
          gold: '#C59B27',
        },
      },
    },
  },
  plugins: [],
};
