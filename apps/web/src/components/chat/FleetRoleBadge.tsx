import type { FleetTeamRole } from "@t3tools/contracts";
import { CoffeeIcon, CrownIcon, HammerIcon, ShieldCheckIcon } from "lucide-react";
import { type ReactNode, memo } from "react";
import { cn } from "~/lib/utils";

export interface FleetRoleMeta {
  readonly title: string;
  readonly shortLabel: string;
  readonly icon: ReactNode;
  readonly className: string;
}

export const FLEET_ROLE_CONFIG: Record<FleetTeamRole, FleetRoleMeta> = {
  architect: {
    title: "Principal Architect",
    shortLabel: "Architect",
    icon: <CrownIcon className="size-3 text-warning" aria-hidden="true" />,
    className: "border-warning/30 bg-warning-surface text-warning",
  },
  lead_implementer: {
    title: "Senior Implementer",
    shortLabel: "Main",
    icon: <HammerIcon className="size-3 text-info" aria-hidden="true" />,
    className: "border-info/30 bg-info/10 text-info",
  },
  intern: {
    title: "The Intern",
    shortLabel: "Intern",
    icon: <CoffeeIcon className="size-3 text-muted-foreground" aria-hidden="true" />,
    className: "border-border bg-muted/40 text-muted-foreground",
  },
  security_auditor: {
    title: "Infosec Officer",
    shortLabel: "Security",
    icon: <ShieldCheckIcon className="size-3 text-success" aria-hidden="true" />,
    className: "border-success/30 bg-success/10 text-success",
  },
};

export interface FleetRoleBadgeProps {
  readonly role: FleetTeamRole;
  readonly className?: string;
  readonly compact?: boolean;
}

export const FleetRoleBadge = memo(function FleetRoleBadge({
  role,
  className,
  compact = false,
}: FleetRoleBadgeProps) {
  const meta = FLEET_ROLE_CONFIG[role];
  if (!meta) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-3xs font-medium tracking-wide uppercase transition-colors select-none",
        meta.className,
        className,
      )}
      aria-label={meta.title}
    >
      {meta.icon}
      <span>{compact ? meta.shortLabel : meta.title}</span>
    </span>
  );
});
