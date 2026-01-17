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
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                // ... (Usually in v4 we rely on CSS variables mapped in @theme, but explicit can help some tools)
            },
            fontFamily: {
                sans: ["var(--font-sans)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
