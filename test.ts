import { Schema } from "effect";
import { Effect } from "effect";

const MySchema = Schema.Struct({
  userId: Schema.Number,
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean,
});

const program = Effect.gen(function* () {
  console.log("Fetching data...");
  const response = yield* Effect.tryPromise(() => fetch("https://jsonplaceholder.typicode.com/todos/1"));
  
  console.log("Decoding response directly...");
  const maybeResult = yield* Effect.either(Schema.decodeUnknown(MySchema)(response));
  if (maybeResult._tag === "Right") {
    console.log("Success directly decoding Response:", maybeResult.right);
  } else {
    console.log("Failed to decode Response directly:", maybeResult.left.message);
  }
  
  console.log("Decoding parsed JSON...");
  const json = yield* Effect.tryPromise(() => response.json());
  const result2 = yield* Schema.decodeUnknown(MySchema)(json);
  console.log("Success decoding JSON:", result2);
});

Effect.runPromise(program).catch(console.error);