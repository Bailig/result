import { describe, it, expect, expectTypeOf } from "vitest";
import { success, fail, Result } from "./result";

describe("success()", () => {
  it("should have properties", () => {
    const result = success(1);
    expect(result.success).toBe(true);
    expect(result.fail).toBe(false);
    expect(result.value).toBe(1);
  });

  it("should have correct methods", () => {
    const result = success(1) as Result<number, never>;
    expect(result.ok()).toBe(1);
    expect(result.unwrap()).toBe(1);
    expect(result.unwrapOr(2)).toBe(1);
    expect(result.expect("test")).toBe(1);
  });

  it("should have correct type", () => {
    expectTypeOf(success(1)).toEqualTypeOf<{
      success: true;
      fail: false;
      value: number;
      ok: () => number;
      unwrap: () => number;
      unwrapOr: () => number;
      expect: () => number;
    }>();
  });
});

describe("fail()", () => {
  it("should have properties", () => {
    const result = fail(new Error("test"));
    expect(result.ok()).toBe(undefined);
    expect(result.success).toBe(false);
    expect(result.fail).toBe(true);
    expect(result.error.message).toBe("test");
  });

  it("should have correct methods", () => {
    const result = fail(new Error("test"));
    expect(() => result.unwrap()).toThrowError("test");
    expect(result.unwrapOr(2)).toBe(2);
    expect(() => result.expect("test")).toThrowError("test");
  });

  it("should have correct type", () => {
    expectTypeOf(fail(new Error("test"))).toEqualTypeOf<{
      success: false;
      fail: true;
      error: Error;
      ok: () => undefined;
      unwrap: () => never;
      unwrapOr: <TDefault>(defaultValue: TDefault) => TDefault;
      expect: (message: string) => never;
    }>();
  });
});

const parseNumber = (value: string) => {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return fail(new Error("Not a number"));
  }
  return success(number);
};

describe("parseNumber()", () => {
  it("should return success", () => {
    const result = parseNumber("1");
    expect(result.success).toBe(true);
    expect(result.fail).toBe(false);

    // @ts-expect-error
    result.value;

    if (result.success) {
      expect(result.value).toBe(1);
    }
  });

  it("should return fail", () => {
    const result = parseNumber("a");
    expect(result.success).toBe(false);
    expect(result.fail).toBe(true);

    // @ts-expect-error
    result.error;

    if (result.fail) {
      expect(result.error.message).toBe("Not a number");
    }
  });
});
