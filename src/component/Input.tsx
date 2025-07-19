import { useSnapshot } from "valtio";
import { useCallback, useContext, type InputHTMLAttributes } from "react";
import { FormContext } from "./FormContext";
import { Label } from "./Label";
import { Icon, type IconName } from "../assets/icons";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
    suggestions?: string[];
    name: string;
    label?: string;
    endIcon?: IconName;
}

export const Input = ({ onChange, endIcon, suggestions, label, className = '', onClick, ...props }: InputProps) => {
    const state = useContext<object>(FormContext);
    const snap = useSnapshot(state);
    const value = Reflect.get(snap, props.name) ?? '';

    // minor hotfix, because if the list too long then it will show on the right side of the screen
    if (suggestions && suggestions.length > 10) {
        suggestions = suggestions.slice(0, 10);
    }

    const onChangeHandler = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        Reflect.set(state, props.name, ev.currentTarget.value);
        onChange?.(ev);
    }, [props.name, state, onChange]);

    const labelCmp = label ? (
        <Label htmlFor={props.name}>
            {label}
        </Label>
    ) : null;

    const classes = [
        `bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-full`,
        className
    ];

    if (props.type === 'date') {
        classes.push('cursor-pointer');
    }

    let endIconCmp = null;
    if (endIcon) {
        classes.push('pr-10');
        endIconCmp = (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={onClick}>
                <Icon name={endIcon} className="text-gray-400" width={16} height={16} />
            </span>
        );
    }

    if (suggestions) {
        const listId = `${props.name}-suggestions`;
        return (
            <div className="w-full relative">  
                {labelCmp}
                <input
                    type='text'
                    className={classes.join(' ')}
                    onChange={onChangeHandler}
                    list={listId}
                    value={value}
                    {...props}
                />
                {endIconCmp}
                <datalist id={listId}>
                    {suggestions.map((suggestion, index) => (
                        <option key={index} value={suggestion} />
                    ))}
                </datalist>
            </div>
        );
    }

    return (
        <div className="w-full relative">
            {labelCmp}        
            <input
                type='text'
                className={classes.join(' ')}
                value={value}
                autoComplete="off"
                onChange={onChangeHandler}
                {...props}
            />
            {endIconCmp}
        </div>
    );
}