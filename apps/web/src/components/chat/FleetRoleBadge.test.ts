import { describe, expect, it } from "vitest";
import { FLEET_ROLE_CONFIG } from "./FleetRoleBadge";

describe("FleetRoleBadge", () => {
  it("defines metadata for all 4 fleet team roles", () => {
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
});
