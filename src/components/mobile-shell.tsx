import type { ReactNode } from "react";

type MobileShellProps = {
  children: ReactNode;
  className?: string;
};

export function MobileShell({ children, className = "" }: MobileShellProps) {
  return (
    <div
      className={`mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-[var(--app-surface)] ${className}`}
    >
      {children}
    </div>
  );
}
