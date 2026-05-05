import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export const PageShell = ({ children, className }: PageShellProps) => {
  return (
    <div
      className={cn(
    "min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_26%),linear-gradient(to_bottom,#f8fafc,#ffffff)]",
        className,
      )}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 md:px-8 md:py-10">
        {children}
      </div>
    </div>
  );
};
