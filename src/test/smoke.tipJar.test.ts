import { describe, it, expect } from "vitest";
import {
  xionToUxion,
  uxionToXion,
  formatXion,
  XION_DECIMALS,
  MAX_TIP_XION,
  MAX_MESSAGE_LEN,
} from "@/lib/tipJar";

describe("constants", () => {
  it("XION_DECIMALS is 6", () => {
    expect(XION_DECIMALS).toBe(6);
  });

  it("MAX_TIP_XION is 1000", () => {
    expect(MAX_TIP_XION).toBe(1000);
  });

  it("MAX_MESSAGE_LEN is 280", () => {
    expect(MAX_MESSAGE_LEN).toBe(280);
  });
});

describe("xionToUxion", () => {
  it("converts 1 XION to 1_000_000 uxion", () => {
    expect(xionToUxion(1)).toBe(1_000_000n);
  });

  it("converts 0.5 XION to 500_000 uxion", () => {
    expect(xionToUxion(0.5)).toBe(500_000n);
  });

  it("converts 0.000001 XION to 1 uxion", () => {
    expect(xionToUxion(0.000001)).toBe(1n);
  });

  it("converts MAX_TIP_XION without throwing", () => {
    expect(() => xionToUxion(MAX_TIP_XION)).not.toThrow();
  });

  it("throws for amount = 0", () => {
    expect(() => xionToUxion(0)).toThrow();
  });

  it("throws for negative amount", () => {
    expect(() => xionToUxion(-1)).toThrow();
  });

  it("throws for amount exceeding MAX_TIP_XION", () => {
    expect(() => xionToUxion(MAX_TIP_XION + 1)).toThrow();
  });

  it("throws for Infinity", () => {
    expect(() => xionToUxion(Infinity)).toThrow();
  });

  it("throws for NaN", () => {
    expect(() => xionToUxion(NaN)).toThrow();
  });
});

describe("uxionToXion", () => {
  it("converts 1_000_000 uxion to 1 XION", () => {
    expect(uxionToXion(1_000_000n)).toBe(1);
  });

  it("converts 500_000 uxion to 0.5 XION", () => {
    expect(uxionToXion(500_000n)).toBe(0.5);
  });

  it("converts 0 to 0", () => {
    expect(uxionToXion(0)).toBe(0);
  });

  it("works with number input", () => {
    expect(uxionToXion(1_000_000)).toBe(1);
  });

  it("works with string input", () => {
    expect(uxionToXion("1000000")).toBe(1);
  });

  it("round-trips with xionToUxion", () => {
    const original = 2.5;
    const uxion = xionToUxion(original);
    expect(uxionToXion(uxion)).toBe(original);
  });
});

describe("formatXion", () => {
  it("formats 1_000_000 uxion as '1'", () => {
    const formatted = formatXion(1_000_000n);
    expect(formatted).toMatch(/^1(\.0+)?$/); // locale may add decimals
  });

  it("formats 500_000 uxion as '0.5'", () => {
    const formatted = formatXion(500_000n);
    expect(Number(formatted.replace(/,/g, ""))).toBeCloseTo(0.5);
  });

  it("uses the digits parameter (0 digits = integer)", () => {
    const formatted = formatXion(1_000_000n, 0);
    expect(formatted).not.toContain(".");
  });

  it("does not throw for 0 uxion", () => {
    expect(() => formatXion(0)).not.toThrow();
  });
});
