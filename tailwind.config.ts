import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                green: {
                    900: "var(--color-green-900)",
                    800: "var(--color-green-800)",
                    700: "var(--color-green-700)",
                },
                sage: {
                    500: "var(--color-sage-500)",
                    400: "var(--color-sage-400)",
                    200: "#C5D1CC", // Fallback/interpolated for potential missing vars
                    100: "var(--color-sage-100)",
                },
                text: {
                    main: "var(--color-text-main)",
                    muted: "var(--color-text-muted)",
                    light: "var(--color-text-light)",
                    inverse: "var(--color-text-inverse)",
                },
                error: "var(--color-error)",
                success: "var(--color-success)",
                warning: "var(--color-warning)",
            },
            fontFamily: {
                serif: ["var(--font-serif)", "serif"],
                sans: ["var(--font-sans)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
