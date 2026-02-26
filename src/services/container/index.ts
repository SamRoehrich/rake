import { Context, Data, Effect, Schema } from "effect"
import { ConfigError } from "../config";

export class ContainerBuildError extends Data.TaggedError("ContainerError")<{
  message: string;
  e: ConfigError;
}> { };

export class ContainerCreateError extends Data.TaggedError("ContainerError")<{
  message: string;
  e: unknown;
}> { };

export class ContainerError extends Data.TaggedError("ContainerError")<{
  message: string;
  e: Error;
}> { };

type ContainerImpl = {
  create: (options: CreateContainerOptions) => Effect.Effect<C, ContainerBuildError | ContainerCreateError>;
  // ping: Effect.Effect<C, ContainerError>;
  // pause: Effect.Effect<C, ContainerError>;
  // details: Effect.Effect<C, ContainerError>;
  // build: (name: string) => Effect.Effect<boolean, ContainerBuildError>;
}

export class Container extends Context.Tag("oc-server-discovery/services/container/index/Container")<Container, ContainerImpl>() { }

export const ContainerStruct = Schema.Struct({
  id: Schema.String,
  status: Schema.String
});

export type C = typeof ContainerStruct.Type

const CreateContainerCommandOption = Schema.Array(Schema.String)

export const CreateContainerOptions = Schema.Struct({
  name: Schema.String,
  command: CreateContainerCommandOption
});

export type CreateContainerOptions = typeof CreateContainerOptions.Type
