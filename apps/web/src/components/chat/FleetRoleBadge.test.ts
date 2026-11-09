import { describe, expect, it } from "vitest";
import {
  FLEET_ROLE_CONFIG,
  FLEET_ROSTER_ORDER,
  resolveFleetRoleForProvider,
} from "./FleetRoleBadge";

describe("FleetRoleBadge", () => {
  it("defines metadata for all 4 fleet team roles", () => {
    expect(FLEET_ROSTER_ORDER).toEqual([
      "architect",
      "lead_implementer",
      "intern",
      "security_auditor",
    ]);
    expect(FLEET_ROLE_CONFIG.architect.title).toBe("Principal Architect");
    expect(FLEET_ROLE_CONFIG.lead_implementer.title).toBe("Senior Implementer");
    expect(FLEET_ROLE_CONFIG.intern.title).toBe("The Intern");
    expect(FLEET_ROLE_CONFIG.security_auditor.title).toBe("Infosec Officer");
  });

  it("assigns semantic theme tokens for each tier", () => {
    expect(FLEET_ROLE_CONFIG.architect.className).toContain("warning");
    expect(FLEET_ROLE_CONFIG.lead_implementer.className).toContain("info");
    expect(FLEET_ROLE_CONFIG.intern.className).toContain("muted");
    expect(FLEET_ROLE_CONFIG.security_auditor.className).toContain("success");
  });

  it("resolves fleet role by provider instance, driver, and model", () => {
    expect(resolveFleetRoleForProvider({ instanceId: "antigravity", model: "argon" })).toBe(
      "architect",
    );
    expect(
      resolveFleetRoleForProvider({ instanceId: "antigravity", model: "claude-opus-4-6" }),
    ).toBe("architect");
    expect(
      resolveFleetRoleForProvider({ instanceId: "antigravity", model: "gemini-2.5-flash" }),
    ).toBe("lead_implementer");
    expect(resolveFleetRoleForProvider({ instanceId: "freebuff", driverKind: "acpRegistry" })).toBe(
      "lead_implementer",
    );
    expect(resolveFleetRoleForProvider({ instanceId: "pi", driverKind: "pi" })).toBe("intern");
    expect(resolveFleetRoleForProvider({ instanceId: "snyk" })).toBe("security_auditor");
  });
});
