import { Effect, Data, Context, Layer } from 'effect'
import { Config, ConfigLive } from '../services/config'
import { Http, HttpLive } from '../services/http'
export const TAILSCALE_API_URL = "https://api.tailscale.com/api/v2"

class TailscaleHttpClientError extends Data.TaggedError("TailscaleHttpClientError")<{
  message: string;
  e: Error
}> { }

type TailscaleHttpClientImpl = {
  listContainers: Effect.Effect<Response, TailscaleHttpClientError>,
  getContainer: (id: string) => Effect.Effect<Response, TailscaleHttpClientError>
}
export class TailscaleHttpClient extends Context.Tag("oc-server-discovery/tailscale/index/TailscaleHttpClient")<TailscaleHttpClient, TailscaleHttpClientImpl>() { }

export const TailscaleHttpClientLive = Layer.effect(
  TailscaleHttpClient,
  Effect.gen(function*() {
    const config = yield* Config
    const http = yield* Http
    const { tailnetDomain, tailscaleToken, tag } = yield* Effect.all({
      tailnetDomain: config.get("TAILNET_DOMAIN"),
      tag: config.get("TAG"),
      tailscaleToken: config.get("TAILSCALE_TOKEN")
    }).pipe(Effect.catchTag('ConfigError', (e) => Effect.fail(new TailscaleHttpClientError({
      message: "Failed to read config value",
      e
    }))))

    const baseOptions = {
      'Authorization': `Bearer ${tailscaleToken}`
    }

    const listContainers = http.get(`/tailnet/${tailnetDomain}/devices?tags=${tag}`, {
      headers: baseOptions
    }).pipe(Effect.catchTag('HttpNetworkError', (e) => Effect.fail(new TailscaleHttpClientError({
      message: "Tailscale network error",
      e
    }))), Effect.catchTag('HttpRequestError', (e) => Effect.fail(new TailscaleHttpClientError({
      message: 'Tailscale Request error',
      e
    }))))

    const getContainer = (id: string) => http.get(`/device/${id}`, {
      headers: baseOptions
    }).pipe(Effect.catchTag('HttpNetworkError', (e) => Effect.fail(new TailscaleHttpClientError({
      message: "Tailscale network error",
      e
    }))), Effect.catchTag('HttpRequestError', (e) => Effect.fail(new TailscaleHttpClientError({
      message: 'Tailscale Request error',
      e
    }))))

    return { listContainers, getContainer }
  })
).pipe(Layer.provide(HttpLive(TAILSCALE_API_URL)), Layer.provide(ConfigLive))

