type AvatarProps = {
  name: string;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZE = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl",
};

export function Avatar({ name, initials, size = "md", className = "" }: AvatarProps) {
  const letters =
    initials ??
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div
      className={`avatar avatar-placeholder ${className}`}
      aria-hidden
      title={name}
    >
      <div
        className={`${SIZE[size]} rounded-full bg-primary-fixed text-primary font-semibold flex items-center justify-center`}
      >
        {letters}
      </div>
    </div>
  );
}