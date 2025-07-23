import { useSnapshot } from "valtio";
import { useCallback, useContext, useMemo, type InputHTMLAttributes } from "react";
import { FormContext } from "./FormContext";
import { Label } from "./Label";
import { inputStateSetter, inputValueGetter } from "./helper";

interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
    name: string;
    label?: string;
    options: string[] | [string, string?][];
    vertical?: boolean;
}

export const RadioGroup = ({ onChange, options, label, vertical, className = '', ...props }: RadioGroupProps) => {
    const state = useContext<object>(FormContext);
    const snap = useSnapshot(state);
    const value = inputValueGetter(snap, props.name);
    const groupOptions = useMemo(() => {
        return options.map(option => {
            if (typeof option === 'string') {
                return [option, option];
            }
            return option;
        });
    }, [options]);

    const onChangeHandler = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        inputStateSetter(ev.currentTarget, state);
        onChange?.(ev);
    }, [ state, onChange]);
    
    const classes = [
        `w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600`,
        className
    ];

    return (
        <div className="w-full relative flex gap-2 items-center">
            <fieldset className="w-full">
                <legend>{label}</legend>
                <div className={`flex gap-4 w-full justify-evenly ${vertical ? 'flex-col' : ''}`}>
                    {groupOptions.map(([key, label]) => (
                        <div key={key} className="flex items-center gap-2">
                            <input
                                id={`${props.name}-${key}`}
                                type='radio'
                                className={classes.join(' ')}
                                value={key}
                                checked={value === key}
                                onChange={onChangeHandler}
                                {...props}
                            />
                            <Label htmlFor={`${props.name}-${key}`} style={{ margin: '0', padding: '0' }}>
                                {label || key}
                            </Label>
                        </div>
                    ))}
                </div>
            </fieldset>
        </div>
    );
}