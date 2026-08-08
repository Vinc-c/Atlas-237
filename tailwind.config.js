/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        salesforce: {
          blue: {
            DEFAULT: '#0176d3',
            light: '#e0f0fd',
            dark: '#005fb2',
            hover: '#014486',
          },
          dark: '#032d60',
          gray: {
            light: '#f3f3f3',
            border: '#dddbda',
            text: '#514f4d',
            bg: '#f4f6f9',
          }
        }
      },
      fontFamily: {
        glacial: ['"Glacial Indifference"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
