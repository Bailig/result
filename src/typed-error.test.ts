import { describe, it, expect, expectTypeOf } from "vitest";
import { Err, TypedError } from "./typed-error";

describe("TypedError", () => {
  it("should equal to Err", () => {
    expect(TypedError).toEqual(Err);
  });
});

describe("Err", () => {
  it("should have correct type", () => {
    expectTypeOf(new Err({ type: "test" as const })).toEqualTypeOf<
      TypedError<{
        type: "test";
      }>
    >();
  });

  it("should have correct message", () => {
    expect(
      new Err({ type: "test" as const, message: "test message" }).message
    ).toBe("test message");
  });

  it("should have correct stack", () => {
    expect(new Err({ type: "test" as const }).stack).toMatch(
      /typed-error.test.ts:\d+:\d+/
    );
  });

  it("should have type error if type is not string literal", () => {
    // @ts-expect-error
    new Err({ type: "test" });
  });
});
