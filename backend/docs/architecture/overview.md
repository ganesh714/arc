# Architecture Overview

Loom backend is a Spring Boot application acting as a stateless API resource server. 
It focuses solely on CRUD operations for workspace projects and diagram canvases.

## JSONB for Diagram Nodes
To support highly dynamic frontend canvas structures, the `DiagramFile` entity uses a single PostgreSQL `JSONB` column to store all diagram nodes.
- **Why?** Mapping individual shapes (rectangles, diamonds, lines) with dozens of optional styles to relational tables is brittle.
- **How?** The backend uses `JsonNode` (Jackson) and passes the data directly to the frontend without server-side deserialization.

## Cross-Service Responsibility
- `arqulat_auth` owns the user identity, registration, OAuth, and token issuing.
- `loom-backend` simply verifies the JWT, ensures it is not blacklisted by reading from the shared database, and scopes resource ownership using the JWT's subject (user email).
