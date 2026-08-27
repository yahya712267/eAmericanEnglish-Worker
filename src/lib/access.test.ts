import { describe, expect, it } from "vitest";
import { canEnterWorker, initialAccessStatus } from "./access";

describe("Worker access rules", () => {
  it("pre-authorizes the configured owner regardless of email case", () => {
    expect(initialAccessStatus("YAHYA@EAMERICANENGLISH.COM")).toBe("owner");
  });

  it("places every other first-time identity in pending", () => {
    expect(initialAccessStatus("team@example.com")).toBe("pending");
    expect(initialAccessStatus("ya712267@gmail.com")).toBe("pending");
  });

  it("allows only owner and approved users into Worker", () => {
    expect(canEnterWorker("owner")).toBe(true);
    expect(canEnterWorker("approved")).toBe(true);
    for (const status of ["pending", "rejected", "revoked"] as const) expect(canEnterWorker(status)).toBe(false);
  });
});
