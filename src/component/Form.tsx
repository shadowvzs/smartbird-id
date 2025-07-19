import React from "react";
import type { FormHTMLAttributes } from "react";
import { FormContext } from "./FormContext";

interface FormProps<T extends object> extends FormHTMLAttributes<HTMLFormElement> {
    children?: React.ReactNode;
    value: T;
    onSend?: (data: T) => void;
}

export function Form<T extends object>({ children, onSend, className = '', ...props }: FormProps<T>) {
    const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        const data = props.value;

        if (onSend) {
            console.log('Form submitted with data:', data);
            onSend(data);
        }
    };

    return (
        <FormContext value={props.value}>
            <form className={`flex flex-col gap-4 w-full px-4 ${className}`} onSubmit={onSubmit} {...props}>
                {children}
            </form>
        </FormContext>
    );
};