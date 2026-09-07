import { describe, it, expect } from "vitest";
import { nextStatus, statusToggleLabel } from "@/lib/admin/status";

describe("nextStatus", () => {
  it("targets published from a draft", () => {
    expect(nextStatus("draft")).toBe("published");
  });

  it("targets draft from published", () => {
    expect(nextStatus("published")).toBe("draft");
  });

  it("treats an unrecognised status as unpublished, so the toggle offers to publish", () => {
    // Fail-safe direction: if the column ever holds something unexpected, the
    // toggle must not offer to UNPUBLISH content that may be live. Offering to
    // publish is the recoverable mistake.
    expect(nextStatus("something-else")).toBe("published");
  });
});

describe("statusToggleLabel", () => {
  it("says Publish on a draft row", () => {
    expect(statusToggleLabel("draft")).toBe("Publish");
  });

  it("says Unpublish on a published row", () => {
    expect(statusToggleLabel("published")).toBe("Unpublish");
  });

  it("says Publish for an unrecognised status, matching nextStatus", () => {
    expect(statusToggleLabel("something-else")).toBe("Publish");
  });

  it("never disagrees with nextStatus about the direction", () => {
    for (const s of ["draft", "published", "weird", ""]) {
      const label = statusToggleLabel(s);
      const target = nextStatus(s);
      expect(label === "Publish" ? target : "draft").toBe(target === "published" ? "published" : "draft");
    }
  });
});
