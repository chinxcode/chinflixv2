/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}", "./src/app/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Jost", "sans-serif"],
            },
            colors: {
                gray: {
                    900: "#121212",
                    800: "#1E1E1E",
                    700: "#2D2D2D",
                    600: "#3D3D3D",
                    500: "#4D4D4D",
                    400: "#5C5C5C",
                    300: "#6B6B6B",
                    200: "#7A7A7A",
                    100: "#898989",
                },
            },
        },
    },
    plugins: [],
};
