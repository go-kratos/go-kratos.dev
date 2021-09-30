const colors = require('tailwindcss/colors')

module.exports = {
    purge: ['./src/**/*.html', './src/**/*.js', './src/**/*.tsx'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        container: {
            center: true,
        },
        backgroundImage: {
            'contribution': "url('/assets/contribution.png')",
        },
        colors: {
            kratos: {
                400: "#38bdf3",
                500: "#23ade5",
            },
            transparent: 'transparent',
            current: 'currentColor',
            black: colors.black,
            white: colors.white,
            gray: colors.trueGray,
            indigo: colors.indigo,
            red: colors.rose,
            yellow: colors.amber,
        }
    },
    variants: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}