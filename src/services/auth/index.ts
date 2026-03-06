import { Context, Data, type Effect } from 'effect'
import { auth } from '../../lib/auth'

type Session = typeof auth.$Infer.Session

export class AuthError extends Data.TaggedError("AuthError")<{
  message: string;
}> { }

export type AuthImpl = {
  me: () => Effect.Effect<Session, AuthError>
}

export class Auth extends Context.Tag("oc-server-discovery/services/auth/index/Auth")<Auth, AuthImpl>() { }
