import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[#162E20] text-white hover:bg-[#1F422E] focus:ring-[#162E20]", // Deep Leaf
        secondary: "bg-[#8DA399] text-white hover:bg-[#7A8F85] focus:ring-[#8DA399]", // Sage
        outline: "border-2 border-[#162E20] text-[#162E20] bg-transparent hover:bg-[#F9F8F6] focus:ring-[#162E20]",
        ghost: "bg-transparent text-[#162E20] hover:bg-[#F3F4F6] focus:ring-gray-500",
        danger: "bg-[#EF4444] text-white hover:bg-[#DC2626] focus:ring-[#EF4444]", // Fallback red for now, customized later
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : null}
            {children}
        </button>
    );
};
