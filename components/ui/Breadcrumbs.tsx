import Link from "next/link";
import { Icon } from "./Icon";

export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <Icon name="chevron_right" size={16} className="text-outline" />
              ) : null}
              {item.href && !last ? (
                <Link className="hover:text-primary transition-colors" href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "text-base-content font-medium" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}