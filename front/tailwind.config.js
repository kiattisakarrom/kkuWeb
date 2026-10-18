/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sarabun', 'ui-sans-serif', 'system-ui'],
      },
      screens: {
        '3xl': '1620px', // ตัวอย่างการเพิ่ม breakpoint สำหรับหน้าจอขนาดใหญ่กว่า 2xl
        '4xl': '1820px', // ตัวอย่างการเพิ่ม breakpoint สำหรับหน้าจอขนาดใหญ่กว่า 2xl
      },
      colors: {
        'custom-or': '#FFF5E4',
        'custom-r1': '#FFE3E1',
        'custom-r2': '#FFD1D1',
        'custom-r3': '#FF9494',
      },
    },
  },
  variants: {},
  plugins: [require('daisyui')],
};
