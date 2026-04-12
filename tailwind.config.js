/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          600: '#0284c7', // 强调色：深蓝
          700: '#0369a1',
          900: '#0c4a6e', // 标题色
        },
        pro: {
          400: '#fbbf24', // PRO 标签色：金色
        }
      },
    },
  },
  plugins: [],
};
