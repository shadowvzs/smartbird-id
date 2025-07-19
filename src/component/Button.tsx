import type { ButtonHTMLAttributes } from "react";

const buttonAppearances = {
    primary: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
    secondary: 'px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50',
    danger: 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50',
    default: 'px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    appearance?: keyof typeof buttonAppearances;
}

export const Button = ({ children, appearance, className = '', ...props }: ButtonProps) => {
    const classes = appearance && buttonAppearances[appearance] || buttonAppearances.primary;
    const statusClasses = props.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

    return (
        <button
            {...props}
            className={`${classes} ${statusClasses} ${className}`}
        >
            {children}
        </button>
    );
}