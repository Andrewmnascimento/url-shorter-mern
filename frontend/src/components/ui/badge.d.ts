import * as React from "react";
type BadgeVariant = "default" | "secondary" | "outline";
export declare function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & {
    variant?: BadgeVariant;
}): import("react/jsx-runtime").JSX.Element;
export {};
