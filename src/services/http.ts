import { Context, Data, Effect, Layer } from "effect";

type HttpImpl = {
  readonly baseUrl: string
  readonly get: (path: string, options: RequestInit) => Effect.Effect<Response, HttpRequestError | HttpNetworkError, never>
  readonly post: (path: string, options: RequestInit) => Effect.Effect<Response, HttpRequestError | HttpNetworkError, never>
}

class HttpNetworkError extends Data.TaggedError("HttpNetworkError")<{}> { }
class HttpRequestError extends Data.TaggedError("HttpRequestError")<{}> { }

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
  post: (path: string, options: RequestInit) => request(baseUrl, path, {
    ...options,
    method: "POST"
  }),
})

