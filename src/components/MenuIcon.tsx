import React from 'react';
import * as LucideIcons from 'lucide-react';

interface MenuIconProps {
    iconName?: string;
    iconUrl?: string;
    className?: string; // For sizing
}

export const AVAILABLE_ICONS = [
    'BarChart3',
    'DollarSign',
    'Users',
    'ShoppingCart',
    'Package',
    'Settings',
    'TrendingUp',
    'FileText',
    'Building',
    'Truck'
];

export default function MenuIcon({ iconName, iconUrl, className = "h-5 w-5" }: MenuIconProps) {
    if (iconUrl) {
        return (
            <img
                src={iconUrl}
                alt="Menu Icon"
                className={`${className} object-cover rounded-md`}
            />
        );
    }

    if (iconName && iconName in LucideIcons) {
        const IconComponent = (LucideIcons as any)[iconName];
        return <IconComponent className={className} />;
    }

    // Default or fallback
    return <LucideIcons.LayoutGrid className={className} />;
}
