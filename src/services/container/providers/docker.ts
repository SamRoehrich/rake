import { Layer, Effect, Schema } from "effect"
import { Config } from '../../config'
import { Container, ContainerBuildError, ContainerCreateError, ContainerStruct } from ".."
import Dockerode from "dockerode"

export const ContainerLive = Layer.effect(
  Container,
  Effect.gen(function*() {
    const config = yield* Config
    const docker = new Dockerode()
    const create = Effect.gen(function*() {
      // const internalPort = 4096
      // const externalPort = 4096 // TODO: make this random
      const imageName = yield* config.get("image_name").pipe(
        Effect.catchTag('ConfigError', (e) => Effect.fail(new ContainerBuildError({
          message: "Failed to get the docker image name",
          e
        })))
      )

      const container = yield* Effect.tryPromise({
        try: () => docker.createContainer({
          Image: imageName,
          name: "random-name",
          Cmd: ['opencode', 'serve', '--port', '4099', '--hostname', '0.0.0.0'],
          Labels: {
            "managed-by": 'oc-server-discovery'
          }
        }),
        catch: (e) => new ContainerCreateError({
          message: "Failed to create docker container",
          e
        })
      })

      return yield* Schema.decodeUnknown(ContainerStruct)({ id: container.id, status: "creating" }).pipe(
        Effect.mapError((e) => new ContainerCreateError({
          message: "Failed to parse container after creating",
          e
        }))
      )
    })
    return {
      create
    }
  })
)
