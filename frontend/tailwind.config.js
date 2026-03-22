/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#070B16',
        accent: '#4F7CFF',
        ember: '#FF8A3D'
      },
      boxShadow: {
        glow: '0 30px 80px rgba(79, 124, 255, 0.22)'
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at top left, rgba(79,124,255,0.28), transparent 30%), radial-gradient(circle at top right, rgba(255,138,61,0.22), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))'
      }
    }
  },
  plugins: []
};
