# Backend Redevelopment Blueprint: Security, Robustness & Scalability

This document outlines the architecture, strategies, and implementation steps to completely rebuild the backend of **Project Loom**. The goal is to deliver an enterprise-grade, secure, multi-tenant system with resilient asynchronous AI operations.

---

## 1. Core Architecture (Hexagonal / Clean Design)

Instead of traditional layered architecture (which tightly couples business logic to JPA entities and Spring annotations), we will adopt a clean architecture design split by boundaries:

```
in.neuarc.loom/
│
├── domain/                      # Pure Business Logic (No Spring/JPA dependencies)
│   ├── model/                   # User, Project, ConversionJob domain records/entities
│   ├── exception/               # Custom Domain Exceptions
│   └── service/                 # Domain business validation and rules
│
├── ports/                       # Interfaces defining Input/Output boundaries
│   ├── inbound/                 # Use cases invoked by controllers (e.g., ProjectUseCase)
│   └── outbound/                # SPIs implemented by adapters (e.g., ProjectRepositoryPort, AIServicePort)
│
└── adapters/                    # Implementation of Ports (Framework specific)
    ├── inbound/rest/            # Controllers, Request/Response DTOs, Exception Handler
    ├── outbound/jpa/            # Entities, Spring Data Repositories, JPA mapping adapters
    ├── outbound/ai/             # OpenAI Client integration using Spring AI
    └── config/                  # SecurityConfig, AsyncConfig, Bean factories
```

---

## 2. End-to-End Security Architecture

### Authentication & Sessions
*   **Stateless OAuth2 Client/Resource Server:** 
    *   Transition API communication entirely to JWT authorization.
    *   Secure endpoints under `/api/v1/**` to require a valid `Bearer` JWT token.
    *   Validate Google-issued tokens using Spring Security's Built-in JWK configuration.
*   **Security Filter Chain Rules:**
    *   Disable CSRF (since requests are stateless and do not rely on standard HTTP session cookies).
    *   Enforce a strict Content Security Policy (CSP) and CORS configuration allowing only white-listed origins.

### Multi-Tenant Data Isolation
*   **Resource Access Verification:**
    *   Every database query for projects must filter implicitly by the authenticated user's ID or verify permissions dynamically.
    *   Establish a Spring Security Service `@securityService.canAccessProject(projectId)` invoked via method-level annotations (`@PreAuthorize`).
*   **Data Validation:**
    *   Use Spring Validation (`jakarta.validation`) on all incoming request payloads.
    *   Validate that framework selections match an expected Enum (`REACT`, `ANGULAR`, `VANILLA`).

---

## 3. Robust Data Persistence

*   **Version Controlled Schema Migrations:**
    *   Add **Flyway** dependency to `pom.xml`.
    *   Define SQL scripts under `src/main/resources/db/migration/` representing precise schemas for `users`, `projects`, and `conversion_jobs`.
*   **PostgreSQL JSONB Type Binding:**
    *   Use custom Hibernate JSON serialization or `@JdbcTypeCode(SqlTypes.JSON)` to map diagram data into PostgreSQL JSONB columns. This allows complex JSON searches directly in the database without serialization bottlenecks.
*   **Optimistic Concurrency Control:**
    *   Add `@Version` fields to `Project` entities to ensure that parallel client-side saves do not overwrite each other silently (throwing `ObjectOptimisticLockingFailureException` instead).

---

## 4. Resilient Asynchronous AI Pipeline

*   **Non-Blocking Job Processing:**
    *   Wipe standard synchronous endpoints for code conversion.
    *   Expose a task polling endpoint:
        *   `POST /api/v1/convert/{projectId}` -> Immediately creates a queue record, starts background worker, returns `202 Accepted` with a Job UUID.
        *   `GET /api/v1/convert/jobs/{jobId}` -> Returns current status (`QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`).
*   **Task Queue & Thread Management:**
    *   Configure a customized Spring `@Async` executor pool (`ThreadPoolTaskExecutor`) with bounded queue capacities and rejection strategies (e.g., Caller-Runs Policy).
*   **Resilience & Fault Tolerance:**
    *   Utilize **Resilience4j** or **Spring Retry** to handle third-party OpenAI rate limits (`429`) and timeouts (`504`) with exponential backoff.

---

## 5. Execution Phases

### Phase 1: Cleaning & Setup
1.  Backup and delete existing controllers, repositories, services, and entities under `in.neuarc.loom`.
2.  Update `pom.xml` to include Flyway, Resilience4j, and configure proper Spring Boot dependencies.
3.  Implement baseline Clean Architecture folders.

### Phase 2: Schema & Base Adapter Setup
1.  Configure JPA database profiles.
2.  Write Flyway migration scripts (`V1__init_schema.sql`).
3.  Implement JPA entity mappings using proper database constraints (unique indexes, non-nullable columns).

### Phase 3: Identity & Security Integration
1.  Set up Spring Security Filter Chain for Google OAuth2 / JWT bearer verification.
2.  Develop `@PreAuthorize` helper bean for tenant validation.
3.  Configure CORS and headers protection.

### Phase 4: Project Management Adapters
1.  Implement MapStruct DTO converters.
2.  Develop clean REST controllers with robust global exception mapping.

### Phase 5: Asynchronous AI Pipeline
1.  Implement thread pool configurations and Async task runner.
2.  Build AI generator using Spring AI with system instructions and JSON diagram sanitization.
3.  Add polling endpoint to retrieve completed/failed compilation tasks.
