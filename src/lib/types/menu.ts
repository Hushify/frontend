import { SVGProps } from 'react';

export type MenuSeparator = {
    type: 'separator';
    id: string;
};

export type MenuItem = {
    type: 'item';
    name: string;
    action: (() => Promise<void>) | (() => void) | undefined;
    icon: (props: Partial<SVGProps<SVGSVGElement>>) => JSX.Element;
    textOnly: boolean;
    variant: 'primary' | 'secondary' | 'danger';
    disabled: boolean;
    className?: string;
};
