# Security Architecture

The authentication model relies heavily on the `arqulat_auth` service. Loom is purely a Resource Server.

## The JWT Flow
1. User logs in at `accounts.arqulat.com`
2. `arqulat_auth` sets an HttpOnly cookie `arqulat_session` scoped to `.arqulat.com`
3. Browser auto-includes this cookie when requesting `loom.arqulat.com`
4. Loom's `JwtAuthenticationFilter` reads the cookie, verifies the cryptographic signature, extracts the `uid` claim to identify the user's UUID, and authenticates the user.

## Shared Secret
To avoid network hops for every request, `loom-backend` verifies the JWT signature locally using the same `JWT_SECRET` injected into `application.properties`.

## Flawless Logout
If a user logs out at `accounts.arqulat.com`, their JWT ID (`jti`) is added to the `blacklisted_tokens` table in the `public` schema.
Loom performs a native JDBC query to the `public` schema to verify the `jti` is not in this blacklist on every request, ensuring that intercepted tokens are instantly invalidated across services.
