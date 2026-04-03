import type { ReactNode } from "react";

type MobileShellProps = {
  children: ReactNode;
  className?: string;
};

export function MobileShell({ children, className = "" }: MobileShellProps) {
  return (
    <div
      className={`mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-[var(--app-surface)] shadow-[0_0_0_1px_var(--border-subtle),0_24px_64px_-24px_rgba(0,0,0,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}
