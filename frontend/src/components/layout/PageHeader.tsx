import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: string;
}

export function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  return (
    <div className="mb-2 flex flex-wrap items-end justify-between gap-6 pb-4">
      <div className="max-w-2xl">
        {badge && (
          <span className="mb-4 inline-flex rounded-full border border-[#EBEBEB] bg-[#FFF1F2] px-3.5 py-1 text-xs font-semibold text-[#FF385C]">
            {badge}
          </span>
        )}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
    </div>
  );
}
