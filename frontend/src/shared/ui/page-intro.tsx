import type { ReactNode } from 'react';

type PageIntroProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageIntro({ title, description, actions }: PageIntroProps) {
  return (
    <section className="rounded-xl border bg-card/80 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
