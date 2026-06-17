# Loom — Backend Documentation

> **Version:** 0.0.1-SNAPSHOT  
> **Framework:** Spring Boot 3.x · Java 17  
> **Database:** PostgreSQL (Supabase-hosted, `loom` schema)  

---

## 📚 Documentation Index

| Document | Description |
|---|---|
| [Architecture Overview](./architecture/overview.md) | High-level system design and component responsibilities |
| [API Reference](./api/endpoints.md) | Every endpoint with request/response schemas |
| [Database Schema](./database/schema.md) | JSONB column structure and table relations |
| [Security Architecture](./security/architecture.md) | Flawless Cross-Service JWT validation strategies |

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
