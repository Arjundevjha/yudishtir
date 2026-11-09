import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

import {
  createDefaultFleetRoster,
  FleetTeamMember,
  FleetTeamMessage,
  FleetTeamRole,
  FleetTeamSession,
} from "./fleetTeam.ts";
import { ThreadId } from "./baseSchemas.ts";
import { ProviderInstanceId } from "./providerInstance.ts";

describe("fleetTeam contracts", () => {
  it.effect("validates FleetTeamRole literals", () =>
    Effect.gen(function* () {
      const decode = Schema.decodeUnknownEffect(FleetTeamRole);
      const architect = yield* decode("architect");
      const lead = yield* decode("lead_implementer");
      const intern = yield* decode("intern");
      const auditor = yield* decode("security_auditor");

      assert.strictEqual(architect, "architect");
      assert.strictEqual(lead, "lead_implementer");
      assert.strictEqual(intern, "intern");
      assert.strictEqual(auditor, "security_auditor");
    }),
  );

  it.effect("validates and generates default canonical fleet roster", () =>
    Effect.gen(function* () {
      const roster = createDefaultFleetRoster();
      assert.strictEqual(roster.length, 4);

      const [architect, lead, intern, auditor] = roster;
      assert.strictEqual(architect?.role, "architect");
      assert.strictEqual(architect?.displayName, "Antigravity");
      assert.strictEqual(architect?.providerInstanceId, ProviderInstanceId.make("antigravity"));

      assert.strictEqual(lead?.role, "lead_implementer");
      assert.strictEqual(lead?.displayName, "Freebuff");
      assert.strictEqual(lead?.providerInstanceId, ProviderInstanceId.make("freebuff"));

      assert.strictEqual(intern?.role, "intern");
      assert.strictEqual(intern?.displayName, "Pi");
      assert.strictEqual(intern?.providerInstanceId, ProviderInstanceId.make("pi"));

      assert.strictEqual(auditor?.role, "security_auditor");
      assert.strictEqual(auditor?.displayName, "Snyk");

      // Verify all members satisfy FleetTeamMember schema
      const decodeMember = Schema.decodeUnknownEffect(FleetTeamMember);
      for (const member of roster) {
        yield* decodeMember(member);
      }
    }),
  );

  it.effect("encodes and decodes a peer-to-peer fleet message", () =>
    Effect.gen(function* () {
      const decodeMessage = Schema.decodeUnknownEffect(FleetTeamMessage);
      const raw = {
        id: "msg-1",
        threadId: "thread-abc",
        fromRole: "lead_implementer",
        fromInstanceId: "freebuff",
        toRole: "intern",
        toInstanceId: "pi",
        kind: "menial_handoff",
        content: "Please format these 3 files and fix eslint warnings",
        metadata: { files: ["fileA.ts", "fileB.ts"] },
        timestamp: "2026-11-09T10:00:00.000Z",
      };

      const decoded = yield* decodeMessage(raw);
      assert.strictEqual(decoded.fromRole, "lead_implementer");
      assert.strictEqual(decoded.toRole, "intern");
      assert.strictEqual(decoded.kind, "menial_handoff");
      assert.strictEqual(decoded.threadId, ThreadId.make("thread-abc"));
    }),
  );

  it.effect("validates full FleetTeamSession state lifecycle", () =>
    Effect.gen(function* () {
      const decodeSession = Schema.decodeUnknownEffect(FleetTeamSession);
      const rawSession = {
        threadId: "thread:fleet:1",
        projectId: "project:default",
        title: "Distributed Rate Limiter",
        objective: "Build a token bucket rate limiter with Redis caching",
        members: createDefaultFleetRoster(),
        workItems: [
          {
            id: "work-1",
            title: "Core Token Bucket Engine",
            description: "Implement token bucket algorithm in isolated worktree",
            assignedRole: "lead_implementer",
            assignedInstanceId: "freebuff",
            targetFiles: ["packages/limiter/src/tokenBucket.ts"],
            status: "in_progress",
            worktreeBranch: "team/limiter-core",
            createdAt: "2026-11-09T10:00:00.000Z",
            updatedAt: "2026-11-09T10:05:00.000Z",
          },
        ],
        activeStage: "construction",
        securityPassed: true,
        createdAt: "2026-11-09T10:00:00.000Z",
        updatedAt: "2026-11-09T10:05:00.000Z",
      };

      const session = yield* decodeSession(rawSession);
      assert.strictEqual(session.activeStage, "construction");
      assert.strictEqual(session.workItems.length, 1);
      assert.strictEqual(session.workItems[0]?.assignedRole, "lead_implementer");
      assert.strictEqual(session.securityPassed, true);
    }),
  );
});
