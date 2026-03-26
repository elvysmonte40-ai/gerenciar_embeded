import { jsx } from 'react/jsx-runtime';
import 'react';
import * as LucideIcons from 'lucide-react';

const AVAILABLE_ICONS = [
  "BarChart3",
  "DollarSign",
  "Users",
  "ShoppingCart",
  "Package",
  "Settings",
  "TrendingUp",
  "FileText",
  "Building",
  "Truck"
];
function MenuIcon({ iconName, iconUrl, className = "h-5 w-5" }) {
  if (iconUrl) {
    return /* @__PURE__ */ jsx(
      "img",
      {
        src: iconUrl,
        alt: "Menu Icon",
        className: `${className} object-cover rounded-md`
      }
    );
  }
  if (iconName && iconName in LucideIcons) {
    const IconComponent = LucideIcons[iconName];
    return /* @__PURE__ */ jsx(IconComponent, { className });
  }
  return /* @__PURE__ */ jsx(LucideIcons.LayoutGrid, { className });
}

export { AVAILABLE_ICONS as A, MenuIcon as M };
