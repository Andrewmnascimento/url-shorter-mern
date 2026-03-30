import * as React from "react";

import { cn } from "../../lib/utils";

type BadgeVariant = "default" | "secondary" | "outline";

const variantMap: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "text-foreground border border-border",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variantMap[variant],
        className,
      )}
      {...props}
    />
  );
}
