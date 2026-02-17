import { Effect } from "effect";
import { Config } from "../services/config";
import { getContainers } from "../tailscale";

export const GetContainers = Effect.provideService(getContainers, Config)
