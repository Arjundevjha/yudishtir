import * as Schema from "effect/Schema";
import { IsoDateTime, ProjectId, ThreadId, TrimmedNonEmptyString } from "./baseSchemas.ts";
import { ProviderInstanceId } from "./providerInstance.ts";

/** Roles within the Autonomous Software Engineering Fleet */
export const FleetTeamRole = Schema.Literals([
  "architect", // Argon / Claude Opus: System design, RFCs, task breakdown, final sign-off
  "lead_implementer", // Freebuff / Flash: Core full-stack coding, features, refactors
  "intern", // Pi: Menial tasks, formatting, lint fixes, JSDoc, mundane renames
  "security_auditor", // Snyk: SAST analysis, taint tracking, CVE/dependency checks
]);
export type FleetTeamRole = typeof FleetTeamRole.Type;

/** Member of the active Fleet team */
export const FleetTeamMember = Schema.Struct({
  role: FleetTeamRole,
  providerInstanceId: ProviderInstanceId,
  modelTier: TrimmedNonEmptyString,
  displayName: TrimmedNonEmptyString,
  title: TrimmedNonEmptyString,
  avatarIcon: TrimmedNonEmptyString,
  badgeColor: TrimmedNonEmptyString,
  status: Schema.Literals(["idle", "planning", "implementing", "reviewing", "auditing", "blocked"]),
});
export type FleetTeamMember = typeof FleetTeamMember.Type;

/** Status of an isolated fleet work item */
export const FleetWorkItemStatus = Schema.Literals([
  "pending",
  "in_progress",
  "under_review",
  "security_auditing",
  "approved",
  "rejected",
]);
export type FleetWorkItemStatus = typeof FleetWorkItemStatus.Type;

/** Discrete work item assigned to a team member in an isolated worktree branch */
export const FleetWorkItem = Schema.Struct({
  id: TrimmedNonEmptyString,
  title: TrimmedNonEmptyString,
  description: TrimmedNonEmptyString,
  assignedRole: FleetTeamRole,
  assignedInstanceId: ProviderInstanceId,
  targetFiles: Schema.Array(TrimmedNonEmptyString),
  status: FleetWorkItemStatus,
  worktreeBranch: Schema.NullOr(TrimmedNonEmptyString),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type FleetWorkItem = typeof FleetWorkItem.Type;

/** Communication kinds between fleet team peers */
export const FleetMessageKind = Schema.Literals([
  "broadcast", // Tech Lead broadcast to all team members
  "peer_question", // Direct question to a teammate (e.g. Freebuff asking Pi for types)
  "peer_response", // Direct response from peer
  "task_delegated", // Delegation of a work package
  "menial_handoff", // Core workforce delegating chore to Pi (The Intern)
  "review_request", // Requesting Architect/Snyk review
  "review_verdict", // Approval or revision notes from Architect
  "security_scan", // Snyk SAST scan result
]);
export type FleetMessageKind = typeof FleetMessageKind.Type;

/** A message exchanged in the Fleet Team room */
export const FleetTeamMessage = Schema.Struct({
  id: TrimmedNonEmptyString,
  threadId: ThreadId,
  fromRole: FleetTeamRole,
  fromInstanceId: ProviderInstanceId,
  toRole: Schema.NullOr(FleetTeamRole),
  toInstanceId: Schema.NullOr(ProviderInstanceId),
  kind: FleetMessageKind,
  content: TrimmedNonEmptyString,
  metadata: Schema.optionalKey(Schema.Record(Schema.String, Schema.Unknown)),
  timestamp: IsoDateTime,
});
export type FleetTeamMessage = typeof FleetTeamMessage.Type;

/** Overall lifecycle stage of the fleet team initiative */
export const FleetTeamStage = Schema.Literals([
  "planning", // Architect drafting RFC and breaking down work
  "construction", // Core workforce (Freebuff/Flash) building features in worktrees
  "intern_cleanup", // The Intern (Pi) handling formatting, linting, and docs
  "security_audit", // Snyk scanning branch for security vulnerabilities
  "final_review", // Architect performing final inspection and merge approval
  "completed", // Initiative merged and complete
]);
export type FleetTeamStage = typeof FleetTeamStage.Type;

/** Fleet Team Session state */
export const FleetTeamSession = Schema.Struct({
  threadId: ThreadId,
  projectId: ProjectId,
  title: TrimmedNonEmptyString,
  objective: TrimmedNonEmptyString,
  members: Schema.Array(FleetTeamMember),
  workItems: Schema.Array(FleetWorkItem),
  activeStage: FleetTeamStage,
  securityPassed: Schema.Boolean,
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type FleetTeamSession = typeof FleetTeamSession.Type;

/** Creates the canonical Yudishtir SWE Team Roster */
export function createDefaultFleetRoster(): ReadonlyArray<FleetTeamMember> {
  return [
    {
      role: "architect",
      providerInstanceId: ProviderInstanceId.make("antigravity"),
      modelTier: "Argon / Claude Opus",
      displayName: "Antigravity",
      title: "Principal Architect",
      avatarIcon: "crown",
      badgeColor: "#f59e0b", // Gold
      status: "idle",
    },
    {
      role: "lead_implementer",
      providerInstanceId: ProviderInstanceId.make("freebuff"),
      modelTier: "MiMo v2.6 / GLM-5.3",
      displayName: "Freebuff",
      title: "Senior Implementer",
      avatarIcon: "hammer",
      badgeColor: "#06b6d4", // Cyan
      status: "idle",
    },
    {
      role: "intern",
      providerInstanceId: ProviderInstanceId.make("pi"),
      modelTier: "GitHub Copilot (gpt-4.1)",
      displayName: "Pi",
      title: "The Intern",
      avatarIcon: "coffee",
      badgeColor: "#64748b", // Slate
      status: "idle",
    },
    {
      role: "security_auditor",
      providerInstanceId: ProviderInstanceId.make("antigravity"), // Executed via MCP
      modelTier: "Snyk SAST Engine",
      displayName: "Snyk",
      title: "Infosec Officer",
      avatarIcon: "shield-check",
      badgeColor: "#10b981", // Emerald
      status: "idle",
    },
  ];
}
