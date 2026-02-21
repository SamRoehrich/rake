import { Context, Data, Effect, Layer, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";

type HttpImpl = {
  readonly baseUrl: string
  readonly get: (path: string, options: RequestInit) => Effect.Effect<Response, HttpRequestError | HttpNetworkError, never>
  readonly getJson: <A, I>(path: string, options: RequestInit, schema: Schema.Schema<A, I, never>) => Effect.Effect<A, HttpJsonError | ParseError | HttpRequestError | HttpNetworkError, never>
  readonly post: (path: string, options: RequestInit) => Effect.Effect<Response, HttpRequestError | HttpNetworkError, never>
}

class HttpNetworkError extends Data.TaggedError("HttpNetworkError")<{}> { }
class HttpRequestError extends Data.TaggedError("HttpRequestError")<{}> { }
class HttpJsonError extends Data.TaggedError("HttpJsonError")<{ cause: string }> { }

export class Http extends Context.Tag("oc-server-discovery/services/http")<Http, HttpImpl>() { }

const request = (baseUrl: string, path: string, options: RequestInit) => Effect.tryPromise({
  try: () => fetch(baseUrl + path, options),
  catch: () => new HttpNetworkError()
}).pipe(Effect.filterOrFail(res => res.ok, () => new HttpRequestError()))

export const HttpLive = (baseUrl: string) => Layer.succeed(Http, {
  baseUrl,
  get: (path: string, options: RequestInit) => request(baseUrl, path, {
    ...options,
    method: "GET"
  }),
  getJson: (path: string, options: RequestInit, schema) => request(baseUrl, path, {
    ...options,
    method: "GET"
  }).pipe(Effect.flatMap((res) => Effect.tryPromise({
    try: () => res.json(),
    catch: (e) => new HttpJsonError({ cause: String(e) })
  })), Effect.flatMap(Schema.decodeUnknown(schema))),
  post: (path: string, options: RequestInit) => request(baseUrl, path, {
    ...options,
    method: "POST"
  }),
})

