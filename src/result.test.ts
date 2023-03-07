import { describe, it, expect, expectTypeOf, assertType } from "vitest";
import { success, fail, Result, r, Success, Fail } from "./result";

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
    expect(result.map((value) => value + 1).unwrap()).toBe(2);
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
      map: <TNewValue>(
        mapper: (value: number) => TNewValue
      ) => Success<TNewValue>;
      mapError: () => Success<number>;
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
    expect(() => result.map().unwrap()).toThrowError("test");
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
      map: () => Fail<Error>;
      mapError: <TNewError extends Error>(
        mapper: (error: Error) => TNewError
      ) => Fail<TNewError>;
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

const fetchUser = async (success: boolean): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => (success ? resolve("John") : reject(new Error("Not a number"))),
      0
    );
  });
};

describe("result()", () => {
  it("should return success", async () => {
    const result = await r(fetchUser(true));
    expect(result.success).toBe(true);
    expect(result.fail).toBe(false);

    // @ts-expect-error
    result.value;

    if (result.success) {
      expect(result.value).toBe("John");
    }
  });

  it("should return fail", async () => {
    const result = await r(fetchUser(false));
    expect(result.success).toBe(false);
    expect(result.fail).toBe(true);

    // @ts-expect-error
    result.error;

    if (result.fail) {
      expect(result.error.message).toBe("Not a number");
    }
  });
});

describe("Result type", () => {
  it("should have correct type", () => {
    const result = success(1) as Result<number, Error>;
    if (result.success) {
      assertType<number>(result.value);
      assertType<false>(result.fail);
      // @ts-expect-error
      result.error;
    } else {
      assertType<Error>(result.error);
      assertType<true>(result.fail);
      // @ts-expect-error
      result.value;
    }
  });

  it("should have correct method types", () => {
    const result = success(1) as Result<number, Error>;

    assertType<number>(result.unwrap());
    assertType<string | number>(result.unwrapOr("2"));
    assertType<number>(result.expect("test"));
    assertType<number | undefined>(result.ok());

    const mappedResult = result.map((value) => {
      assertType<number>(value);
      return String(value);
    });
    assertType<Result<string, Error>>(mappedResult);

    const mappedErrorResult = result.mapError((error) => {
      assertType<Error>(error);
      return new TypeError("test");
    });
    assertType<Result<number, TypeError>>(mappedErrorResult);
  });
});
