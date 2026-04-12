import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../../lib/utils";
function Card({ className, ...props }) {
    return (_jsx("div", { "data-slot": "card", className: cn("bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm", className), ...props }));
}
function CardHeader({ className, ...props }) {
    return (_jsx("div", { "data-slot": "card-header", className: cn("grid auto-rows-min gap-1.5 px-6 pt-6", className), ...props }));
}
function CardTitle({ className, ...props }) {
    return (_jsx("h3", { "data-slot": "card-title", className: cn("leading-none font-semibold", className), ...props }));
}
function CardDescription({ className, ...props }) {
    return (_jsx("p", { "data-slot": "card-description", className: cn("text-muted-foreground text-sm", className), ...props }));
}
function CardContent({ className, ...props }) {
    return (_jsx("div", { "data-slot": "card-content", className: cn("px-6 pb-6", className), ...props }));
}
export { Card, CardContent, CardDescription, CardHeader, CardTitle };
