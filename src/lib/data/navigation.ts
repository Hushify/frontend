import { SVGProps } from 'react';
import { Folder, Icon, Trash } from 'lucide-react';

type Navigation = {
    icon: ((props: SVGProps<SVGSVGElement>) => JSX.Element) | Icon;
    label: string;
};

type NavigationItem = Navigation & {
    type: 'NavItem';
    link: string;
    exact: boolean;
};

type NestedNavigationItem = Navigation & {
    type: 'NestedNavItem';
    children: NavigationItem[];
};

export type NavigationItems = (NavigationItem | NestedNavigationItem)[];

export const NavigationData: NavigationItems = [
    {
        type: 'NavItem',
        icon: Folder,
        label: 'My Drive',
        link: '/drive',
        exact: false,
    },
    {
        type: 'NavItem',
        icon: Trash,
        label: 'Trash',
        link: '/drive/trash',
        exact: true,
    },
];
