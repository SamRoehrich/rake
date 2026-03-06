import { Layer, Effect, Schema, Schedule } from "effect"
import { Config } from '../../config'
import { Container, ContainerError, ContainerCreateError, ContainerStruct, type CreateContainerOptions } from ".."
import Dockerode from "dockerode"
import { DB } from "../../database"
import { containers } from "../../database/schemas"
import { CurrentUser } from "../../user"

export const ContainerLive = Layer.effect(
  Container,
  Effect.gen(function*() {
    const config = yield* Config
    const db = yield* DB
    const docker = new Dockerode()
    const create = (options: CreateContainerOptions) => Effect.gen(function*() {
      const user = yield* CurrentUser
      // const internalPort = 4096
      // const externalPort = 4096 // TODO: make this random
      const imageName = yield* config.get("IMAGE_NAME").pipe(
        Effect.catchTag('ConfigError', (e) => Effect.fail(new ContainerCreateError({
          message: "Failed to get the docker image name",
          e
        })))
      )

      const tsAuthKey = yield* config.get("TAILSCALE_AUTH_KEY").pipe(
        Effect.catchTag('ConfigError', (e) => Effect.fail(new ContainerCreateError({
          message: "Failed to get tsAuthKey",
          e
        })))
      )

      const tailscaleContainer = yield* Effect.tryPromise({
        try: () => docker.createContainer({
          Image: 'tailscale/tailscale:latest',
          name: `ts-${options.name}`,
          Env: [
            `TS_AUTHKEY=${tsAuthKey}`,
            "TS_STATE_DIR=var/lib/tailscale/",
            "TS_USERSPACE=false"
          ],
          HostConfig: {
            CapAdd: ["NET_ADMIN", "NET_RAW"],
            Devices: [{ PathOnHost: "/dev/net/tun", PathInContainer: "/dev/net/tun", CgroupPermissions: "rwm" }],
            Binds: [`ts-state-${options.name}:/var/lib/tailscale`],
          },
          Labels: {
            "managed-by": "oc-server-discovery",
            "tailscale-sidecar": "true",
          },
        }),
        catch: (e) => new ContainerCreateError({
          message: "Failed to create tailscale sidecar container",
          e
        })
      })


      yield* Effect.tryPromise({
        try: () => tailscaleContainer.start(),
        catch: (e) => new ContainerCreateError({
          message: "Failed to start docker sidecar",
          e
        })
      })

      const sandboxContainer = yield* Effect.tryPromise({
        try: () => docker.createContainer({
          Image: imageName,
          name: options.name,
          Cmd: [...options.command],
          Labels: {
            "managed-by": 'oc-server-discovery'
          }
        }),
        catch: (e) => new ContainerCreateError({
          message: "Failed to create docker container",
          e
        })
      })

      yield* Effect.tryPromise({
        try: () => sandboxContainer.start(),
        catch: (e) => new ContainerCreateError({
          message: "Failed to start container",
          e
        })
      })

      const getContainerStatus = Effect.tryPromise({
        try: () => sandboxContainer.inspect(),
        catch: (e) => new ContainerError({
          message: "Failed to get container details",
          e
        })
      })

      const containerInfo = yield* getContainerStatus.pipe(
        Effect.flatMap((value) => (
          value.State.Running ? Effect.succeed(value) : Effect.fail(new ContainerError({
            message: "Container not started yet",
            e: "ContainerNotStarted"
          }))
        )),
        Effect.retry({
          schedule: Schedule.spaced("100 millis"),
          until: (e) => e.e === "ContainerNotStarted"
        }),
        Effect.timeout("5 seconds")
      )

      yield* db.insert(containers).values({
        name: containerInfo.Name,
        hostname: containerInfo.Config.Hostname,
        ip: containerInfo.NetworkSettings.Networks[0]?.IPAddress || "",
        creatorUserId: user.id
      })

      return yield* Schema.decodeUnknown(ContainerStruct)({ id: sandboxContainer.id, status: "creating" }).pipe(
        Effect.mapError((e) => new ContainerCreateError({
          message: "Failed to parse container after creating",
          e
        }))
      )
    }).pipe(
      Effect.catchTags({
        TimeoutException: (e) => new ContainerError({
          message: "Timeout occured",
          e
        }),
        EffectDrizzleQueryError: (e) => new ContainerError({
          message: "Failed to add container to DB",
          e
        })
      })
    )
    return {
      create
    }
  })
)
