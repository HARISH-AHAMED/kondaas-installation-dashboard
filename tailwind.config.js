/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-red': '#D71920',
                'brand-dark': '#1a1a1a',
                'brand-gray': '#f3f4f6',
            }
        },
    },
    plugins: [],
}
