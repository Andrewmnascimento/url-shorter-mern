import type { InputHTMLAttributes } from "react";
import { cn } from "../lib/utils";

export const Input = ({
  className,
  type = "text",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      type={type}
      {...props}
    />
  );
};
