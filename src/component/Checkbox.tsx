import { useSnapshot } from "valtio";
import { useCallback, useContext, type InputHTMLAttributes } from "react";
import { FormContext } from "./FormContext";
import { Label } from "./Label";
import { inputStateSetter, inputValueGetter } from "./helper";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
    name: string;
    label?: string;
}

export const Checkbox = ({ onChange, label, className = '', onClick, ...props }: CheckboxProps) => {
    const state = useContext<object>(FormContext);
    const snap = useSnapshot(state);
    const value = inputValueGetter(snap, props.name);

    const onChangeHandler = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        inputStateSetter(ev.currentTarget, state);
        onChange?.(ev);
    }, [ state, onChange]);

    const labelCmp = label ? (
        <Label htmlFor={props.name} style={{ margin: '0', padding: '0' }}>
            {label}
        </Label>
    ) : null;

    const classes = [
        `w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600`,
        className
    ];

    return (
        <div className="w-full relative flex gap-2 items-center">      
            <input
                type='checkbox'
                className={classes.join(' ')}
                value={value}
                onChange={onChangeHandler}
                {...props}
            />
            {labelCmp}
        </div>
    );
}