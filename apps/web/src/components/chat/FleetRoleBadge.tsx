import type { FleetTeamRole } from "@t3tools/contracts";
import { CoffeeIcon, CrownIcon, HammerIcon, ShieldCheckIcon } from "lucide-react";
import { type ReactNode, memo } from "react";
import { cn } from "~/lib/utils";

export interface FleetRoleMeta {
  readonly title: string;
  readonly shortLabel: string;
  readonly rosterModels: string;
  readonly responsibility: string;
  readonly icon: ReactNode;
  readonly className: string;
}

export const FLEET_ROLE_CONFIG: Record<FleetTeamRole, FleetRoleMeta> = {
  architect: {
    title: "Principal Architect",
    shortLabel: "Architect",
    rosterModels: "Antigravity · Argon / Claude Opus",
    responsibility: "System design, RFC specs, and final code review sign-off",
    icon: <CrownIcon className="size-3 text-warning" aria-hidden="true" />,
    className: "border-warning/30 bg-warning-surface text-warning",
  },
  lead_implementer: {
    title: "Senior Implementer",
    shortLabel: "Main",
    rosterModels: "Freebuff (MiMo v2.6 / GLM-5.3) · Antigravity Flash",
    responsibility: "Core full-stack implementation and tests in isolated git worktrees",
    icon: <HammerIcon className="size-3 text-info" aria-hidden="true" />,
    className: "border-info/30 bg-info/10 text-info",
  },
  intern: {
    title: "The Intern",
    shortLabel: "Intern",
    rosterModels: "Pi · GitHub Copilot (gpt-4.1)",
    responsibility: "Formatting (vp fmt), lint fixes, docstrings, and menial chores",
    icon: <CoffeeIcon className="size-3 text-muted-foreground" aria-hidden="true" />,
    className: "border-border bg-muted/40 text-muted-foreground",
  },
  security_auditor: {
    title: "Infosec Officer",
    shortLabel: "Security",
    rosterModels: "Snyk · MCP Hub SAST",
    responsibility: "Automated static application security scans before branch merge",
    icon: <ShieldCheckIcon className="size-3 text-success" aria-hidden="true" />,
    className: "border-success/30 bg-success/10 text-success",
  },
};

export const FLEET_ROSTER_ORDER: ReadonlyArray<FleetTeamRole> = [
  "architect",
  "lead_implementer",
  "intern",
  "security_auditor",
];

export function resolveFleetRoleForProvider(input: {
  readonly instanceId?: string | null | undefined;
  readonly driverKind?: string | null | undefined;
  readonly model?: string | null | undefined;
}): FleetTeamRole | undefined {
  const id = input.instanceId?.toLowerCase() ?? "";
  const driver = input.driverKind?.toLowerCase() ?? "";
  const model = input.model?.toLowerCase() ?? "";

  if (id === "snyk" || model.includes("snyk")) {
    return "security_auditor";
  }
  if (id === "pi" || driver === "pi") {
    return "intern";
  }
  if (id === "freebuff" || driver === "opencode" || id.includes("freebuff")) {
    return "lead_implementer";
  }
  if (id === "antigravity" || driver === "antigravity") {
    if (model.includes("flash")) {
      return "lead_implementer";
    }
    return "architect";
  }
  if (
    driver === "claudeagent" ||
    id === "claude" ||
    model.includes("opus") ||
    model.includes("argon")
  ) {
    return "architect";
  }
  return undefined;
}

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

export const FleetRosterBanner = memo(function FleetRosterBanner() {
  return (
    <div className="mb-4 rounded-xl border border-border/70 bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-warning/15 text-warning font-semibold text-xs">
            Ψ
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Autonomous SWE Fleet Team
            </h3>
            <p className="text-2xs text-muted-foreground">
              Self-organizing engineering division with quota-aware role routing
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {FLEET_ROSTER_ORDER.map((roleKey) => {
          const meta = FLEET_ROLE_CONFIG[roleKey];
          return (
            <div
              key={roleKey}
              className="flex flex-col justify-between rounded-lg border border-border/60 bg-background/60 p-2.5"
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  {meta.icon}
                  {meta.title}
                </span>
                <FleetRoleBadge role={roleKey} compact />
              </div>
              <p className="mt-1.5 text-2xs font-mono text-muted-foreground/90 leading-tight">
                {meta.rosterModels}
              </p>
              <p className="mt-1 text-3xs text-muted-foreground/75 leading-normal">
                {meta.responsibility}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
});
