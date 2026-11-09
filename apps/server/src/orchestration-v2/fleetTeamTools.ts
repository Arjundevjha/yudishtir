import {
  FleetMessageKind,
  FleetTeamRole,
  FleetWorkItem,
  FleetWorkItemStatus,
  IsoDateTime,
  ThreadId,
  TrimmedNonEmptyString,
} from "@t3tools/contracts";
import * as Schema from "effect/Schema";

/** Error raised during Fleet Team operations */
export class FleetTeamError extends Schema.TaggedError<FleetTeamError>()("FleetTeamError", {
  code: Schema.Literals([
    "member_not_found",
    "role_not_authorized",
    "worktree_unavailable",
    "peer_unreachable",
    "security_scan_failed",
    "invalid_transition",
  ]),
  message: Schema.String,
  detail: Schema.optionalKey(Schema.String),
}) {}

/** Input for the Architect delegating work to Freebuff or Pi */
export const FleetTeamDelegateTaskInput = Schema.Struct({
  threadId: ThreadId,
  title: TrimmedNonEmptyString,
  description: TrimmedNonEmptyString,
  assignedRole: FleetTeamRole,
  targetFiles: Schema.Array(TrimmedNonEmptyString),
  worktreeBranch: Schema.optionalKey(TrimmedNonEmptyString),
});
export type FleetTeamDelegateTaskInput = typeof FleetTeamDelegateTaskInput.Type;

export const FleetTeamDelegateTaskResult = Schema.Struct({
  workItem: FleetWorkItem,
  dispatchedTo: TrimmedNonEmptyString,
  worktreePath: Schema.NullOr(TrimmedNonEmptyString),
});
export type FleetTeamDelegateTaskResult = typeof FleetTeamDelegateTaskResult.Type;

/** Input for direct peer communication between fleet members */
export const FleetTeamMessagePeerInput = Schema.Struct({
  threadId: ThreadId,
  fromRole: FleetTeamRole,
  toRole: FleetTeamRole,
  kind: FleetMessageKind,
  content: TrimmedNonEmptyString,
  metadata: Schema.optionalKey(Schema.Record(Schema.String, Schema.Unknown)),
});
export type FleetTeamMessagePeerInput = typeof FleetTeamMessagePeerInput.Type;

export const FleetTeamMessagePeerResult = Schema.Struct({
  delivered: Schema.Literal(true),
  messageId: TrimmedNonEmptyString,
  timestamp: IsoDateTime,
});
export type FleetTeamMessagePeerResult = typeof FleetTeamMessagePeerResult.Type;

/** Input for Freebuff delegating menial chores (formatting, linting) to Pi */
export const FleetTeamDelegateMenialInput = Schema.Struct({
  threadId: ThreadId,
  choreDescription: TrimmedNonEmptyString,
  targetFiles: Schema.Array(TrimmedNonEmptyString),
  actionKind: Schema.Literals(["format", "lint_fix", "jsdoc", "rename", "test_verification"]),
});
export type FleetTeamDelegateMenialInput = typeof FleetTeamDelegateMenialInput.Type;

export const FleetTeamDelegateMenialResult = Schema.Struct({
  acceptedByIntern: Schema.Literal(true),
  taskId: TrimmedNonEmptyString,
  estimatedFilesCount: Schema.Number,
});
export type FleetTeamDelegateMenialResult = typeof FleetTeamDelegateMenialResult.Type;

/** Input for submitting completed work for Architect sign-off & Snyk scan */
export const FleetTeamRequestReviewInput = Schema.Struct({
  threadId: ThreadId,
  workItemId: TrimmedNonEmptyString,
  summaryOfChanges: TrimmedNonEmptyString,
  worktreeBranch: TrimmedNonEmptyString,
});
export type FleetTeamRequestReviewInput = typeof FleetTeamRequestReviewInput.Type;

export const FleetTeamRequestReviewResult = Schema.Struct({
  status: FleetWorkItemStatus,
  securityScanQueued: Schema.Boolean,
  reviewTurnId: TrimmedNonEmptyString,
});
export type FleetTeamRequestReviewResult = typeof FleetTeamRequestReviewResult.Type;

/** Input for triggering an automated Snyk SAST scan */
export const FleetTeamSecurityAuditInput = Schema.Struct({
  targetPath: TrimmedNonEmptyString,
  severityThreshold: Schema.optionalKey(Schema.Literals(["low", "medium", "high"])),
});
export type FleetTeamSecurityAuditInput = typeof FleetTeamSecurityAuditInput.Type;

export const FleetTeamSecurityAuditResult = Schema.Struct({
  passed: Schema.Boolean,
  issueCount: Schema.Number,
  details: Schema.NullOr(Schema.String),
});
export type FleetTeamSecurityAuditResult = typeof FleetTeamSecurityAuditResult.Type;
