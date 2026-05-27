# Loom Project Documentation

## 1. Overview
Loom is a visual diagramming and node-based modeling platform that converts designed charts into production-ready code (React, Angular, Vanilla JS) using an internal AI module. Designed for high scalability and professional developer workflows.

## 2. Technical Architecture

### Frontend (React + TypeScript)
- **Framework:** React 19 with Vite.
- **Styling:** Vanilla CSS Modules + Tailwind CSS for utility-first layout.
- **State Management:** React Context API (`DiagramContext` for visual logic, `AuthContext` for user sessions).
- **Icons:** Lucide-React.
- **Authentication:** Google OAuth2 integration with conditional routing (Landing Page vs. Workspace).

### Backend (Java + Spring Boot)
- **Framework:** Spring Boot 4.0.6.
- **Persistence:** PostgreSQL (Production) / H2 (Development) with Spring Data JPA.
- **Security:** Spring Security with OAuth2 Client (Google Login).
- **AI Integration:** Spring AI (OpenAI Starter) for code generation orchestration.
- **API Documentation:** OpenAPI/Swagger (Available at `/swagger-ui.html`).
- **Scalability:** Stateless architecture, UUID-based entities, and Asynchronous Job Pattern for AI tasks.

## 3. Implemented Features

### Phase 1: Professional Foundation
- Established Clean Architecture (Controller -> Service -> Repository -> Entity).
- Implemented DTO pattern with MapStruct for secure API contracts.
- Centralized Global Exception Handling for graceful error reporting.
- Configured H2 database and JPA persistence for diagrams.

### Phase 2: Security & Multi-Tenancy
- **Google Login:** Implemented full OAuth2 flow.
- **User Management:** Automated profile creation in the database upon Google authentication.
- **Data Isolation:** Established User-Project relationships (One-to-Many) to ensure users only access their own data.
- **Conditional UI:** Developed a modern Landing Page for unauthenticated visitors and a private Workspace for users.

### Phase 3: Scalable Job Tracking
- **ConversionJob System:** Implemented a job tracking entity to manage long-running AI code generation tasks.
- **Status Management:** Supports `QUEUED`, `PROCESSING`, `COMPLETED`, and `FAILED` states.
- **Multi-Tenant Filtering:** Updated services to handle data isolation at the service layer.

## 4. Database Schema
- **Users:** Stores profile data from OAuth2.
- **Projects:** Contains diagram metadata and framework preferences.
- **Diagrams (Planned JSONB):** Flexible storage for node-based visual data.
- **ConversionJobs:** Logs AI generation attempts and stores the resulting code.

## 5. Roadmap
1. **AI Prompt Engineering:** Implement specialized prompts to translate `JSON` diagrams into high-quality components.
2. **Asynchronous Processing:** Integrate a task queue (e.g., Spring `@Async` or Redis) for non-blocking AI generation.
3. **Project Dashboard:** A dedicated space for users to manage multiple projects.
4. **Cloud Persistence:** Integration with AWS S3 for storing large generated codebases.

---
*Created by Gemini CLI - Professional Full-Stack Backend & Frontend Architecture.*
