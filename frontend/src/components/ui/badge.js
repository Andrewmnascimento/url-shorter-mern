import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../../lib/utils";
const variantMap = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "text-foreground border border-border",
};
export function Badge({ className, variant = "default", ...props }) {
    return (_jsx("span", { "data-slot": "badge", className: cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", variantMap[variant], className), ...props }));
}
