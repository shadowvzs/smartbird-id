import { useSnapshot } from "valtio";
import { useCallback, useContext, type SelectHTMLAttributes } from "react";
import { FormContext } from "./FormContext";
import { inputStateSetter, inputValueGetter } from "./helper";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
    options: [string, string?][] | string[];
    name: string;
    label?: string;
}

export const Select = ({ options, label, className = '', onChange, ...props }: SelectProps) => {
    const state = useContext<object>(FormContext);
    const snap = useSnapshot(state);
    const value = inputValueGetter(snap, props.name);
    const selectOptions = options.map(option => {
        if (Array.isArray(option)) {
            return option;
        }
        return [option, option];
    });

    const labelCmp = label ? (
        <label htmlFor={props.name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {label}
        </label>
    ) : null;

    const onChangeHandler = useCallback((ev: React.ChangeEvent<HTMLSelectElement>) => {
        inputStateSetter(ev.currentTarget, state);
        onChange?.(ev);
    }, [state, onChange]);

    return (
        <div className="w-full">
            {labelCmp}
            <select {...props} onChange={onChangeHandler} value={value} className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-full ${className}`}>
                {selectOptions.map(([key, label]) => (
                    <option value={key} key={key}> {label || key} </option>
                ))}
            </select>
        </div>
    );
}