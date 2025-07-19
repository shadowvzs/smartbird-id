import type { SVGProps } from "react";
import { AddDocument } from "./AddDocumentIcon";
import { SearchIcon } from "./SearchIcon";
import { SettingsIcon } from "./SettingsIcon";
import { QuitIcon } from "./QuitIcon";
import { CameraIcon } from "./CameraIcon";
import { Button, type ButtonProps } from "../../component/Button";
import { LeftIcon } from "./LeftIcon";
import { CloseIcon } from "./CloseIcon";

const iconMap = {
    addDocument: AddDocument,
    camera: CameraIcon,
    search: SearchIcon,
    settings: SettingsIcon,
    quit: QuitIcon,
    left: LeftIcon,
    close: CloseIcon
} as const;

export type IconName = keyof typeof iconMap;

interface IconButtonProps extends ButtonProps {
    name: IconName;
    text?: string;
    iconProps?: React.HTMLAttributes<HTMLOrSVGElement>;
    iconClassName?: string;
}

export const IconButton = ({ appearance, name, text, iconProps, iconClassName, className = '', ...props }: IconButtonProps) => {
    const Icon = iconMap[name];

    if (!Icon) { 
        console.error(`Missing the icon with name: ${name}`);
        return null;
    }

    if (text) {
        return (
            <Button
                className={className}
                appearance={appearance}
                {...props}
            >
                <div className='flex gap-4 items-center'>
                    <Icon className={iconClassName} {...iconProps} />
                    <span>{text}</span>
                </div>
            </Button>
        );
    }

    return <Icon className={iconClassName} {...iconProps} />;
}

export const Icon = (props: SVGProps<HTMLOrSVGElement> & { name: keyof typeof iconMap }) => {
    const Icon = iconMap[props.name];
    if (!Icon) {
        console.error(`Missing the icon with name: ${props.name}`);
        return null;
    }
    return <Icon {...props} />;
}