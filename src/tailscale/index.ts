import { Effect, Data, Context, Layer, Schema } from 'effect'
import { Config, ConfigLive } from '../services/config'
import { Http, HttpLive } from '../services/http'
export const TAILSCALE_API_URL = "https://api.tailscale.com/api/v2"

class TailscaleHttpClientError extends Data.TaggedError("TailscaleHttpClientError")<{
  message: string;
  e: Error
}> { }

type TailscaleHttpClientImpl = {
  listContainers: Effect.Effect<TailscaleDevices, TailscaleHttpClientError>,
  getContainer: (id: string) => Effect.Effect<TailscaleContainer, TailscaleHttpClientError>
}
export class TailscaleHttpClient extends Context.Tag("oc-server-discovery/tailscale/index/TailscaleHttpClient")<TailscaleHttpClient, TailscaleHttpClientImpl>() { }

export const TailscaleHttpClientLive = Layer.effect(
  TailscaleHttpClient,
  Effect.gen(function*() {
    const config = yield* Config
    const http = yield* Http
    const { tailscaleToken, tag } = yield* Effect.all({
      tag: config.get("TAG"),
      tailscaleToken: config.get("TAILSCALE_TOKEN")
    }).pipe(Effect.catchTag('ConfigError', (e) => Effect.fail(new TailscaleHttpClientError({
      message: "Failed to read config value",
      e
    }))))

    const headers = {
      'Authorization': `Bearer ${tailscaleToken}`
    }

    const listContainers = http.getJson(`/tailnet/-/devices?tags=${tag}`, { headers }, TailscaleDevicesSchema).pipe(
      Effect.catchTags({
        HttpJsonError: (e) => Effect.fail(new TailscaleHttpClientError({
          message: "res.json() failed from the tailscale API",
          e
        })),
        HttpNetworkError: (e) => Effect.fail(new TailscaleHttpClientError({
          message: "HTTP Network error in tailscale http client",
          e
        })),
        HttpRequestError: (e) => Effect.fail(new TailscaleHttpClientError({
          message: "HTTP request error in tailscale HTTP client",
          e
        })),
        ParseError: (e) => Effect.fail(new TailscaleHttpClientError({
          message: "Tailscale resposne did not meet TailscaleContainer schema requirements",
          e
        }))
      })
    )

    const getContainer = (id: string) => http.getJson(`/device/${id}`, { headers }, TailscaleContainerSchema).pipe(
      Effect.catchTags({
        HttpJsonError: (e) => Effect.fail(new TailscaleHttpClientError({
          message: "res.json() failed from the tailscale API",
          e
        })),
        HttpNetworkError: (e) => Effect.fail(new TailscaleHttpClientError({
          message: "HTTP Network error in tailscale http client",
          e
        })),
        HttpRequestError: (e) => Effect.fail(new TailscaleHttpClientError({
          message: "HTTP request error in tailscale HTTP client",
          e
        })),
        ParseError: (e) => Effect.fail(new TailscaleHttpClientError({
          message: "Tailscale resposne did not meet TailscaleContainer schema requirements",
          e
        }))
      })
    )
    return { getContainer, listContainers }
  }
  )).pipe(Layer.provide(HttpLive(TAILSCALE_API_URL)), Layer.provide(ConfigLive))

const TailscaleContainerSchema = Schema.Struct({
  addresses: Schema.Array(Schema.String),
  name: Schema.String,
  id: Schema.String,
  hostname: Schema.String
})

const TailscaleDevicesSchema = Schema.Struct({
  devices: Schema.Array(TailscaleContainerSchema)
})

type TailscaleContainer = typeof TailscaleContainerSchema.Type
type TailscaleDevices = typeof TailscaleDevicesSchema.Type

