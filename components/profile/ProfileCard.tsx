import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";

type ProfileCardProps = {
  name: string;
  subtitle: string;
  initials?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
};

export function ProfileCard({ name, subtitle, initials, action, children }: ProfileCardProps) {
  return (
    <section className="card-surface p-6 flex flex-col items-center text-center">
      <Avatar initials={initials} name={name} size="xl" />
      <h1 className="mt-4 text-xl font-semibold">{name}</h1>
      <p className="text-sm text-muted mb-4">{subtitle}</p>
      {action}
      {children}
    </section>
  );
}

export function InfoRow({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted">
      <Icon name={icon} size={16} />
      {children}
    </p>
  );
}