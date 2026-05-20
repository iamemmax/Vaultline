import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthCard({ title, description, footer, children }: AuthCardProps) {
  return (
    <div className="fade-in space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>

      <div className="space-y-4">{children}</div>

      {footer ? (
        <div className="border-t border-border pt-5 text-sm">{footer}</div>
      ) : null}
    </div>
  );
}
