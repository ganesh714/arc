# Loom - Developer Reference Guide

This document provides a detailed technical overview of the Loom platform's architecture, authentication logic, and development workflows.

## 1. System Architecture

Loom is built as a decoupled Full-Stack application designed for scalability and professional modeling.

- **Frontend:** React 19 + TypeScript + Vite.
- **Backend:** Spring Boot 4.0.6 + Spring Security.
- **Database:** H2 (Development - Persistent File) / PostgreSQL (Production).

---

## 2. Authentication & User Management

Loom implements a hybrid authentication model to support both frictionless exploration and secure data persistence.

### 2.1 Google OAuth2 Integration
The primary authentication flow is handled by Spring Security OAuth2.
- **Workflow:** Frontend triggers a redirect to `/oauth2/authorization/google` on the backend.
- **Persistence:** Upon successful login, the `SecurityConfig` success handler extracts user details (email, name, picture) and synchronizes them with the `User` table.
- **Session Management:** Standard JSESSIONID cookies are used. The frontend `AuthContext` must include `credentials: 'include'` in all fetch calls to maintain the session.

### 2.2 Guest Mode (Preview Access)
To reduce friction, Loom allows "Guest Mode" access.
- **Approach:** A client-side state in `AuthContext` tracks `isGuest`.
- **Capabilities:** Guests can use the full Canvas, use all drawing tools, and export code.
- **Restrictions:** Guests cannot create multiple projects or save their progress to the cloud. UI indicators (amber status dots) and "Sign in to save" prompts guide guests toward full registration.

---

## 3. Data Persistence Strategy

### 3.1 Local Development (File-based H2)
To ensure developers don't lose their test diagrams every time the server restarts, we use a file-based H2 database.
- **Configuration:** `jdbc:h2:file:./data/loomdb`.
- **Storage:** Data is stored in the `backend/data/` folder. **Do not commit this folder.**

### 3.2 Production (Relational JPA)
The system is built on Spring Data JPA with a "Clean Architecture" pattern.
- **Entities:** `User`, `Project`, and `ConversionJob` use UUIDs as primary keys for security and easier migration to distributed systems.
- **Multi-Tenancy:** All queries are filtered by the authenticated `userId` to ensure data isolation.

---

## 4. AI Code Generation Logic

Loom translates visual diagrams into production-ready code via an internal AI module.
- **Status Tracking:** The `ConversionJob` system manages the lifecycle of AI tasks (`QUEUED` -> `PROCESSING` -> `COMPLETED`).
- **Framework Support:** Users can target React, Angular, or Vanilla JS.
- **Asynchronous Execution:** AI generation is designed to be non-blocking, allowing the user to continue working while code is being "woven."

---

## 5. Development Workflow

### Starting the Stack
1. **Backend:** 
   - Fill Google OAuth credentials in `application.properties`.
   - Run `./mvnw spring-boot:run`.
2. **Frontend:**
   - Run `npm install` and `npm run dev`.
   - Access at `http://localhost:5173`.

### Key API Endpoints
- `GET /api/v1/auth/me`: Validates current session and returns User profile.
- `GET /api/v1/projects/user/{userId}`: Retrieves projects for the authenticated user.
- `POST /api/v1/convert/{projectId}`: Triggers AI code generation.

---
*Document Version: 1.0.0 | Created for Neuarc Loom Developers*
