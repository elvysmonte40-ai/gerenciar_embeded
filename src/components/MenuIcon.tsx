import React from 'react';
import {
    BarChart3,
    DollarSign,
    Users,
    ShoppingCart,
    Package,
    Settings,
    TrendingUp,
    FileText,
    Building,
    Truck,
    LayoutGrid
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MenuIconProps {
    iconName?: string;
    iconUrl?: string;
    className?: string; // For sizing
}

const ICON_MAP: Record<string, LucideIcon> = {
    BarChart3,
    DollarSign,
    Users,
    ShoppingCart,
    Package,
    Settings,
    TrendingUp,
    FileText,
    Building,
    Truck
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

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

    const IconComponent = iconName ? ICON_MAP[iconName] : null;
    if (IconComponent) {
        return <IconComponent className={className} />;
    }

    // Default or fallback
    return <LayoutGrid className={className} />;
}
