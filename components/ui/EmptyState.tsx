import { Icon } from "./Icon";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="card-surface p-8 flex flex-col items-center text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center text-primary">
        <Icon name={icon} size={32} />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted max-w-sm">{description}</p>
      {action}
    </div>
  );
}