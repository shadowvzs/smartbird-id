import type { HTMLProps } from "react";

export const Label = ({ children, className = '', ...props }: HTMLProps<HTMLLabelElement>) => {
    return (
        <label {...props} className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${className}`}>
            {children}
        </label>
    );
}