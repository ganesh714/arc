# Loom — Backend Documentation

> **Version:** 0.0.1-SNAPSHOT  
> **Framework:** Spring Boot 3.x · Java 17  
> **Database:** PostgreSQL (Supabase-hosted, `loom` schema)  

---

## 📚 Documentation Index

| Document | Description |
|---|---|
| [Architecture Overview](./architecture/overview.md) | High-level stateless system design, low-level JSONB analysis, and data flow execution paths |
| [Project Structure](./architecture/project-structure.md) | Annotated file tree outlining controllers, services, repositories, and exception boundaries |
| [API Reference](./api/endpoints.md) | Every endpoint with request/response schemas, updated with embedded DTOs and 409 Conflicts |
| [Error Handling](./api/error-handling.md) | How the `GlobalExceptionHandler` intercepts exceptions and maps them to HTTP status codes |
| [Database Schema](./database/schema.md) | JSONB column structure, `user_id` foreign keys, indexes, and Flyway migration strategy |
| [Configuration Reference](./config/reference.md) | Environment variables, `.env` templates, database URLs, and payload size safety limits |
| [Security Architecture](./security/architecture.md) | Filter chain analysis, JWT cryptographic signature verification, and native JDBC blacklists |
| [Known Issues & TODOs](./known-issues.md) | Tracked issues organized by severity and historical resolution log |

---

## Quick Start

```bash
# 1. Run the arqulat_auth backend (Loom relies on it for Auth)
# Ensure arqulat_auth is running on port 8080

# 2. Run the Loom backend
cd loom/backend
./mvnw spring-boot:run
```

Server starts on **http://localhost:8081**.
