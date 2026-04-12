import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../../lib/utils";
function Alert({ className, ...props }) {
    return (_jsx("div", { "data-slot": "alert", role: "alert", className: cn("w-full rounded-lg border bg-card px-4 py-3 text-sm", className), ...props }));
}
function AlertTitle({ className, ...props }) {
    return (_jsx("h5", { "data-slot": "alert-title", className: cn("mb-1 font-medium", className), ...props }));
}
function AlertDescription({ className, ...props }) {
    return (_jsx("div", { "data-slot": "alert-description", className: cn("text-muted-foreground text-sm", className), ...props }));
}
export { Alert, AlertDescription, AlertTitle };
