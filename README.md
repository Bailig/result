# BYLG Result

The Result type is a utility type that represents either a successful or failed operation, with the ability to store both a value and an error message.

## Installation

```sh
npm install @bylg/result
```

## Quick Start

```ts
import { success, fail } from "@bylg/result";

const parseNumber = (input: string) => {
  const result = Number(input);
  if (isNaN(result)) {
    return fail(new Error(`"${input}" is not a number`));
  }
  return success(result);
};

const result = parseNumber("42");

if (result.success) {
  console.log(`The parsed number is ${result.value}`);
} else {
  console.error(`Parsing failed with error: ${result.error.message}`);
}
```

Here, we check if the Result is a success or fail using the success and fail properties. If it's a success, we can safely access the value property to get the parsed number. If it's a fail, we can handle the error by accessing the error property and its message property.

## Using Result Methods

The Result type has a number of methods that can be used to transform the value or error.

```ts
const result1 = parseNumber("42").ok(); // this will ignore the error
//      ^? const result1: number | undefined

const result2 = parseNumber("42").unwrap(); // this will throw the error
//      ^? const result2: number

const result3 = parseNumber("42").unwrapOr("default"); // this will ignore the error and return the "default"
//      ^? const result3: number | "default"

const result4 = parseNumber("42").expect("error message"); // this will throw the error with the error message
//      ^? const result4: number
```

## Using Result with Typed Errors

TypedError is a utility type that can be used to create an error with a string literal type property, so that the error can be checked and inferred.

```ts
import { success, fail, TypedError as Err } from "@bylg/result";

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

const result = getUser();

if (result.fail) {
  if (result.error.type === "notLoggedIn") {
    const { data } = result.error;
    //       ^? const data: string
  } else if (result.error.type === "noUserId") {
    const { data } = result.error;
    //       ^? const data: boolean
  } else if (result.error.type === "noUser") {
    const { data } = result.error;
    //       ^? const data: number
  }
}
```
