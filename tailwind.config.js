/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cinzel': ['Cinzel', 'sans-serif'],
      },
      backgroundImage: {
        'button': 'url(\'../assets/button.png\') no-repeat center center / contain',
      },
      colors: {
        'primary': "#CCAC68",
        'secondary': "#352975"
      }
    },
  },
  plugins: [],
}

