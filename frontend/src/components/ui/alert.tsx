import * as React from "react";

import { cn } from "../../lib/utils";

function Alert({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn("w-full rounded-lg border bg-card px-4 py-3 text-sm", className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return (
    <h5 data-slot="alert-title" className={cn("mb-1 font-medium", className)} {...props} />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
