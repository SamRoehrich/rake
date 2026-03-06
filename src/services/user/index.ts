import { auth } from "../../lib/auth";
import { Context } from "effect";

type AuthSession = typeof auth.$Infer.Session;
type AuthUser = AuthSession['user']

export class CurrentUser extends Context.Tag("oc-server-discovery/services/user/index/CurrentUser")<CurrentUser, AuthUser>() { }
