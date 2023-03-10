import { describe, it, expect, expectTypeOf, assertType } from "vitest";
import { fail, success } from "./result";
import { Err } from "./typed-error";

const getSession = (): any => ({ get: () => "userId" });
const db: any = { users: { find: () => "user" } };

const getUser = () => {
  const session = getSession();
  if (!session) {
    return fail(new Err({ type: "notLoggedIn" as const, data: "string" }));
  }

  const userId = session.get("userId");
  if (!userId) {
    return fail(new Err({ type: "noUserId" as const, data: false }));
  }

  const user = db.users.find(userId);
  if (!user) {
    return fail(new Err({ type: "noUser" as const, data: 123 }));
  }

  return success(user as "user");
};

describe("getUser()", () => {
  it("should infer type of data", () => {
    const result = getUser();
    if (result.fail) {
      if (result.error.type === "notLoggedIn") {
        expectTypeOf(result.error.data).toEqualTypeOf<string>();
      } else if (result.error.type === "noUserId") {
        expectTypeOf(result.error.data).toEqualTypeOf<boolean>();
      } else if (result.error.type === "noUser") {
        expectTypeOf(result.error.data).toEqualTypeOf<number>();
      }
    }
  });

  it("should infer type of result for each methods", () => {
    assertType<"user" | void>(getUser().ok());
    assertType<"user">(getUser().unwrap());
    assertType<"user" | "default">(getUser().unwrapOr("default"));
    assertType<"user">(getUser().expect("message"));
  });
});
