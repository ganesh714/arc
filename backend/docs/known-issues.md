# Known Issues & TODOs

Tracked issues organized by severity. Updated as issues are resolved.

---

## 🔴 Critical — Fix Before Deploying

| # | Issue | Details | Status |
|---|---|---|---|
| 1 | ~~**Hibernate may alter `arqulat_auth`'s `blacklisted_tokens` table**~~ | ~~`BlacklistedToken` entity points to `@Table(schema = "public")` and `ddl-auto=update` is active. Hibernate could add columns or modify the table owned by `arqulat_auth`, corrupting the auth service.~~ | ✅ Resolved — Replaced JPA entity with native JDBC query |
| 2 | **Zero input validation on all endpoints** | DTOs (`CreateProjectRequest`, `CreateFileRequest`, etc.) have no `@NotBlank`, `@Size`, or `@Pattern` annotations. Controllers don't use `@Valid`. Allows null names, 100K-char strings, and invalid hex colors. | ⏳ TODO — Add Jakarta Validation annotations + `@Valid` |
| 3 | **Unlimited JSONB payload size** | `PUT /api/files/{fileId}` accepts `JsonNode nodes` with no size limit. A single malicious request could send 500MB of JSON, exhausting server memory and filling the database. | ⏳ TODO — Add Tomcat max request size + service-level check |
| 4 | ~~**No global exception handler**~~ | ~~No `@ControllerAdvice`. All `RuntimeException`s return raw `500 Internal Server Error` with full Java stack traces leaked to the client. Auth failures also return 500 instead of 403.~~ | ✅ Resolved — Created `GlobalExceptionHandler` with custom exceptions |

---

## 🟠 High — Serious Bugs / Security Gaps

| # | Issue | Details | Status |
|---|---|---|---|
| 5 | **Old JWTs without `uid` claim silently fail** | We just added the `uid` custom claim to `arqulat_auth`. Users with pre-existing JWT cookies will have tokens missing this claim. `extractUserId()` returns `null`, causing a silent `401` with no explanation. | ⏳ TODO — Add frontend re-auth flow; force logout when 401 received |
| 6 | **CSRF disabled with cookie-based auth** | Same risk as `arqulat_auth` (issue #5 there). Browsers automatically attach the `arqulat_session` cookie. `SameSite=Lax` mitigates on modern browsers, but isn't bulletproof for older browsers or subdomain attacks. | ⏳ Accepted risk — Same stance as `arqulat_auth` |
| 7 | **`ddl-auto=update` in production** | Hibernate auto-modifying the schema risks data corruption. Should switch to Flyway migrations and `ddl-auto=validate` before deploying, same as `arqulat_auth` already did. | ⏳ TODO — Add Flyway migrations |

---

## 🟡 Medium — Should Fix for Production Quality

| # | Issue | Details | Status |
|---|---|---|---|
| 8 | **`@Data` on JPA entities causes lazy-load & recursion** | Lombok `@Data` generates `toString()`, `equals()`, `hashCode()` that include `List<DiagramFile>`. This triggers lazy-loading on every log/debug, N+1 queries, and potential `StackOverflowError` from bidirectional relationships. | ⏳ TODO — Replace with `@Getter @Setter`, `@ToString(exclude)`, `@EqualsAndHashCode(of = "id")` |
| 9 | **Manual `setUpdatedAt()` fights `@UpdateTimestamp`** | `FileService.createFile()` and `updateFile()` manually set `project.setUpdatedAt(LocalDateTime.now())`, but Hibernate's `@UpdateTimestamp` does this automatically. Creates a race condition and timezone inconsistency. | ⏳ TODO — Remove manual calls |
| 10 | **No database index on `user_id`** | `ProjectRepository.findByUserIdOrderByUpdatedAtDesc()` does a full table scan without an index on `user_id`. Will slow down as user/project count grows. | ⏳ TODO — Add `@Index` on `projects.user_id` |
| 11 | **`show-sql=true`** | Floods logs with SQL in production, potentially exposing data in query parameters. | ⏳ Dev only — disable for production |
| 12 | **Delete last file in project → frontend crash** | `DELETE /api/files/{fileId}` allows deleting the only file. Frontend's `switchProject` assumes `files[0]` exists and will crash on `undefined`. | ⏳ TODO — Add backend guard or frontend null check |
| 12b | **Frontend-Backend DTO Mismatch** | The frontend expects `WorkspaceProject` to contain an array of `files` instantly to render the sidebar. The backend `ProjectSummaryDTO` currently only returns a `fileCount`. Without this, the UI requires complex lazy-loading. | ⏳ TODO — Update `ProjectSummaryDTO` to include `List<FileSummaryDTO> files` |

---

## 🟢 Low — Best Practices / Nice to Have

| # | Issue | Details | Status |
|---|---|---|---|
| 13 | **Use constructor injection** | Replace `@Autowired` field injection with constructor injection across all classes. Easier to test, prevents circular dependencies. Consistent with `arqulat_auth` TODO. | ⏳ TODO |
| 14 | **No duplicate name protection** | Users can create multiple projects or files with identical (or empty) names. No uniqueness constraint on `(user_id, name)`. | ⏳ Low priority — enforce non-blank via validation (see #2) |

---

## Resolution Log

| Date | Issue # | Action Taken |
|---|---|---|
| 2026-06-17 | — | Initial backend scaffold created with full CRUD API |
| 2026-06-17 | — | Switched from `user_email` to `user_id` (UUID) as foreign key |
| 2026-06-17 | — | Added `uid` claim to `arqulat_auth` JWT for cross-service ID mapping |
| 2026-06-17 | 1 | Replaced `BlacklistedToken` JPA entity with native `JdbcTemplate` query to prevent `ddl-auto` from altering auth service tables |
| 2026-06-17 | 4 | Added `GlobalExceptionHandler` and custom exceptions (`ResourceNotFoundException`, `UnauthorizedAccessException`) |
| | | |
