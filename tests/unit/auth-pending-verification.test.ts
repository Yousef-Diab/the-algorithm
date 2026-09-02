import { describe, it, expect } from "vitest";
import {
  PENDING_KEY,
  PENDING_TTL_MS,
  SIGN_IN_PATH,
  VERIFY_EMAIL_PATH,
  clearPending,
  consumeDivert,
  decodePending,
  divertToVerifyEmail,
  encodePending,
  needsEmailVerification,
  readPending,
  rememberPending,
  type PendingStore,
} from "@/lib/auth/pending-verification";

/** An in-memory stand-in for sessionStorage. */
const store = (seed: Record<string, string> = {}): PendingStore & { map: Map<string, string> } => {
  const map = new Map(Object.entries(seed));
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
};

/** A store whose every operation throws, like a browser with site data blocked. */
const hostileStore = (): PendingStore => ({
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
});

const NOW = 1_700_000_000_000;

describe("encodePending / decodePending", () => {
  it("round-trips an address that was just stored", () => {
    expect(decodePending(encodePending("a@b.com", NOW), NOW)).toEqual({
      email: "a@b.com",
      at: NOW,
      divert: true,
    });
  });

  it("keeps a record that is still inside the 15-minute window", () => {
    const raw = encodePending("a@b.com", NOW);
    expect(decodePending(raw, NOW + PENDING_TTL_MS - 1)?.email).toBe("a@b.com");
  });

  it("drops a record older than the code's own lifetime", () => {
    const raw = encodePending("a@b.com", NOW);
    expect(decodePending(raw, NOW + PENDING_TTL_MS + 1)).toBeNull();
  });

  it("drops a record timestamped in the future, which means a clock change rather than a fresh code", () => {
    const raw = encodePending("a@b.com", NOW + PENDING_TTL_MS + 1);
    expect(decodePending(raw, NOW)).toBeNull();
  });

  it("returns null for absent, malformed, or incomplete records rather than throwing", () => {
    expect(decodePending(null)).toBeNull();
    expect(decodePending("")).toBeNull();
    expect(decodePending("not json")).toBeNull();
    expect(decodePending("[]")).toBeNull();
    expect(decodePending('"a string"')).toBeNull();
    expect(decodePending(JSON.stringify({ at: NOW }), NOW)).toBeNull();
    expect(decodePending(JSON.stringify({ email: "", at: NOW }), NOW)).toBeNull();
    expect(decodePending(JSON.stringify({ email: "a@b.com" }), NOW)).toBeNull();
    expect(decodePending(JSON.stringify({ email: "a@b.com", at: "soon" }), NOW)).toBeNull();
  });

  it("treats a missing divert flag as already consumed, so a stale record cannot trap navigation", () => {
    expect(decodePending(JSON.stringify({ email: "a@b.com", at: NOW }), NOW)?.divert).toBe(false);
  });
});

describe("needsEmailVerification", () => {
  it("is true when sign-up returned a user but no session token", () => {
    expect(needsEmailVerification({ user: { email: "a@b.com", emailVerified: false } })).toBe(true);
  });

  it("is true for the same payload wrapped in the { data, error } shape", () => {
    expect(
      needsEmailVerification({ data: { user: { emailVerified: false } }, error: null }),
    ).toBe(true);
  });

  it("is false when a session token was issued, because the user is already signed in", () => {
    expect(needsEmailVerification({ token: "abc", user: { emailVerified: false } })).toBe(false);
  });

  it("is false when the server reports the address as already verified", () => {
    expect(needsEmailVerification({ user: { emailVerified: true } })).toBe(false);
  });

  it("is false when sign-up failed, since no account exists to verify", () => {
    expect(needsEmailVerification({ data: null, error: { message: "taken" } })).toBe(false);
  });

  it("is false for unrecognised payloads, so an unknown shape never strands a signed-in user", () => {
    expect(needsEmailVerification(undefined)).toBe(false);
    expect(needsEmailVerification(null)).toBe(false);
    expect(needsEmailVerification("ok")).toBe(false);
    expect(needsEmailVerification({})).toBe(false);
    expect(needsEmailVerification({ user: "a@b.com" })).toBe(false);
  });
});

describe("divertToVerifyEmail", () => {
  it("sends the post-sign-up hop to the verify screen, carrying the address", () => {
    expect(divertToVerifyEmail(SIGN_IN_PATH, "a@b.com")).toBe(
      `${VERIFY_EMAIL_PATH}?email=a%40b.com`,
    );
  });

  it("preserves the query the auth UI was already carrying", () => {
    expect(divertToVerifyEmail(`${SIGN_IN_PATH}?redirectTo=%2Flesson%2Fm1-01`, "a@b.com")).toBe(
      `${VERIFY_EMAIL_PATH}?redirectTo=%2Flesson%2Fm1-01&email=a%40b.com`,
    );
  });

  it("overwrites a stale email parameter instead of appending a second one", () => {
    expect(divertToVerifyEmail(`${SIGN_IN_PATH}?email=old%40b.com`, "new@b.com")).toBe(
      `${VERIFY_EMAIL_PATH}?email=new%40b.com`,
    );
  });

  it("leaves the href alone when nothing is pending", () => {
    expect(divertToVerifyEmail(SIGN_IN_PATH, null)).toBe(SIGN_IN_PATH);
  });

  it("leaves every destination other than sign-in alone", () => {
    for (const href of ["/auth/sign-up", "/auth/settings", "/", "/lesson/m1-01", VERIFY_EMAIL_PATH]) {
      expect(divertToVerifyEmail(href, "a@b.com")).toBe(href);
    }
  });

  it("never rewrites an absolute or protocol-relative URL", () => {
    for (const href of [
      `https://evil.example.com${SIGN_IN_PATH}`,
      `//evil.example.com${SIGN_IN_PATH}`,
      "javascript:alert(1)",
    ]) {
      expect(divertToVerifyEmail(href, "a@b.com")).toBe(href);
    }
  });
});

describe("the session-storage wrappers", () => {
  it("remembers an address and reads it back without consuming it", () => {
    const s = store();
    rememberPending("a@b.com", s, NOW);
    expect(readPending(s, NOW)).toBe("a@b.com");
    expect(readPending(s, NOW)).toBe("a@b.com");
    expect(s.map.get(PENDING_KEY)).toBeTypeOf("string");
  });

  it("stops reporting an address once its code has expired", () => {
    const s = store();
    rememberPending("a@b.com", s, NOW);
    expect(readPending(s, NOW + PENDING_TTL_MS + 1)).toBeNull();
  });

  it("diverts only the first navigation, so the user can then leave the verify screen", () => {
    const s = store();
    rememberPending("a@b.com", s, NOW);
    expect(consumeDivert(s, NOW)).toBe("a@b.com");
    expect(consumeDivert(s, NOW)).toBeNull();
    // Consuming the redirect must not lose the address the form prefills with.
    expect(readPending(s, NOW)).toBe("a@b.com");
  });

  it("does not divert on an expired record", () => {
    const s = store();
    rememberPending("a@b.com", s, NOW);
    expect(consumeDivert(s, NOW + PENDING_TTL_MS + 1)).toBeNull();
  });

  it("clears the record outright", () => {
    const s = store();
    rememberPending("a@b.com", s, NOW);
    clearPending(s);
    expect(readPending(s, NOW)).toBeNull();
    expect(consumeDivert(s, NOW)).toBeNull();
  });

  it("degrades quietly with no store at all, as on the server", () => {
    expect(() => rememberPending("a@b.com", null)).not.toThrow();
    expect(readPending(null)).toBeNull();
    expect(consumeDivert(null)).toBeNull();
    expect(() => clearPending(null)).not.toThrow();
  });

  it("degrades quietly when the browser blocks site data", () => {
    const s = hostileStore();
    expect(() => rememberPending("a@b.com", s)).not.toThrow();
    expect(readPending(s)).toBeNull();
    expect(consumeDivert(s)).toBeNull();
    expect(() => clearPending(s)).not.toThrow();
  });
});
