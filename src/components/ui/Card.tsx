import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    onClick,
    ...props
}) => {
    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const clickableStyles = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';

    return (
        <div
            className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${paddingStyles[padding]} ${clickableStyles} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};
