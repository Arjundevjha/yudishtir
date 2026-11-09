import { assert, describe, it } from "@effect/vitest";
import { ProjectId, ThreadId, TrimmedNonEmptyString } from "@t3tools/contracts";
import * as Effect from "effect/Effect";

import { FleetTeamCoordinator, FleetTeamCoordinatorLive } from "./FleetTeamCoordinator.ts";

describe("FleetTeamCoordinator", () => {
  it.effect("creates fleet session with canonical 4-member roster", () =>
    Effect.gen(function* () {
      const coordinator = yield* FleetTeamCoordinator;
      const threadId = ThreadId.make("thread:fleet:rate-limiter");
      const projectId = ProjectId.make("project:default");

      const session = yield* coordinator.createSession({
        threadId,
        projectId,
        title: "Distributed Rate Limiter",
        objective: "Design and implement Redis token-bucket rate limiter",
      });

      assert.strictEqual(session.threadId, threadId);
      assert.strictEqual(session.activeStage, "planning");
      assert.strictEqual(session.members.length, 4);

      const roles = session.members.map((m) => m.role);
      assert.deepStrictEqual(roles, [
        "architect",
        "lead_implementer",
        "intern",
        "security_auditor",
      ]);

      const architect = session.members.find((m) => m.role === "architect");
      assert.strictEqual(architect?.displayName, "Antigravity");

      const lead = session.members.find((m) => m.role === "lead_implementer");
      assert.strictEqual(lead?.displayName, "Freebuff");

      const intern = session.members.find((m) => m.role === "intern");
      assert.strictEqual(intern?.displayName, "Pi");
    }).pipe(Effect.provide(FleetTeamCoordinatorLive)),
  );

  it.effect("delegates task to Freebuff in dedicated worktree branch", () =>
    Effect.gen(function* () {
      const coordinator = yield* FleetTeamCoordinator;
      const threadId = ThreadId.make("thread:fleet:task-test");
      const projectId = ProjectId.make("project:default");

      yield* coordinator.createSession({
        threadId,
        projectId,
        title: "Task Delegation",
        objective: "Test work package assignment",
      });

      const delegation = yield* coordinator.delegateTask({
        threadId,
        title: TrimmedNonEmptyString.make("Build Token Bucket Core"),
        description: TrimmedNonEmptyString.make("Implement the token bucket algorithm with tests"),
        assignedRole: "lead_implementer",
        targetFiles: [TrimmedNonEmptyString.make("src/limiter.ts")],
      });

      assert.strictEqual(delegation.dispatchedTo, "Freebuff");
      assert.strictEqual(delegation.workItem.status, "in_progress");
      assert.strictEqual(delegation.workItem.assignedRole, "lead_implementer");
      assert.strictEqual(delegation.worktreePath, "team/fleet:task-test/lead_implementer");

      const session = yield* coordinator.getSession(threadId);
      assert.strictEqual(session.workItems.length, 1);
      assert.strictEqual(session.activeStage, "construction");
    }).pipe(Effect.provide(FleetTeamCoordinatorLive)),
  );

  it.effect("enables direct peer-to-peer message routing between agents", () =>
    Effect.gen(function* () {
      const coordinator = yield* FleetTeamCoordinator;
      const threadId = ThreadId.make("thread:fleet:msg-test");
      const projectId = ProjectId.make("project:default");

      yield* coordinator.createSession({
        threadId,
        projectId,
        title: "Peer Communication",
        objective: "Verify message exchange",
      });

      // Freebuff asks Pi for types
      const sent = yield* coordinator.messagePeer({
        threadId,
        fromRole: "lead_implementer",
        toRole: "intern",
        kind: "peer_question",
        content: TrimmedNonEmptyString.make("What schema does the Redis token config expect?"),
      });

      assert.strictEqual(sent.delivered, true);
      assert.include(sent.messageId, "fleet-msg:");
    }).pipe(Effect.provide(FleetTeamCoordinatorLive)),
  );

  it.effect("delegates menial chore to Pi (The Intern)", () =>
    Effect.gen(function* () {
      const coordinator = yield* FleetTeamCoordinator;
      const threadId = ThreadId.make("thread:fleet:chore-test");
      const projectId = ProjectId.make("project:default");

      yield* coordinator.createSession({
        threadId,
        projectId,
        title: "Menial Delegation",
        objective: "Test intern chore dispatch",
      });

      const result = yield* coordinator.delegateMenial({
        threadId,
        choreDescription: TrimmedNonEmptyString.make("Format code and add JSDoc to exports"),
        targetFiles: [
          TrimmedNonEmptyString.make("packages/limiter/src/index.ts"),
          TrimmedNonEmptyString.make("packages/limiter/src/bucket.ts"),
        ],
        actionKind: "jsdoc",
      });

      assert.strictEqual(result.acceptedByIntern, true);
      assert.strictEqual(result.estimatedFilesCount, 2);
      assert.include(result.taskId, "chore:jsdoc:");
    }).pipe(Effect.provide(FleetTeamCoordinatorLive)),
  );

  it.effect("submits review to Architect and transitions to security audit", () =>
    Effect.gen(function* () {
      const coordinator = yield* FleetTeamCoordinator;
      const threadId = ThreadId.make("thread:fleet:review-test");
      const projectId = ProjectId.make("project:default");

      yield* coordinator.createSession({
        threadId,
        projectId,
        title: "Review Flow",
        objective: "Test review submission",
      });

      const delegation = yield* coordinator.delegateTask({
        threadId,
        title: TrimmedNonEmptyString.make("Core Implementation"),
        description: TrimmedNonEmptyString.make("Write feature code"),
        assignedRole: "lead_implementer",
        targetFiles: [TrimmedNonEmptyString.make("src/index.ts")],
      });

      const review = yield* coordinator.requestReview({
        threadId,
        workItemId: delegation.workItem.id,
        summaryOfChanges: TrimmedNonEmptyString.make(
          "Completed core feature, 12 unit tests passing",
        ),
        worktreeBranch: TrimmedNonEmptyString.make("team/feature/freebuff"),
      });

      assert.strictEqual(review.status, "under_review");
      assert.strictEqual(review.securityScanQueued, true);

      const session = yield* coordinator.getSession(threadId);
      assert.strictEqual(session.activeStage, "security_audit");
      assert.strictEqual(session.workItems[0]?.status, "under_review");

      // Verify security audit
      const audit = yield* coordinator.securityAudit({
        targetPath: TrimmedNonEmptyString.make("packages/limiter/src"),
      });
      assert.strictEqual(audit.passed, true);
      assert.strictEqual(audit.issueCount, 0);
    }).pipe(Effect.provide(FleetTeamCoordinatorLive)),
  );
});
