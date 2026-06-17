# Loom — Frontend Architecture

## Overview
Loom is a React-based interactive canvas application designed for creating architectural diagrams and UI wireframes. It is built using Vite, React 18, and TypeScript.

## Core Technologies
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** CSS Modules / Vanilla CSS / Tailwind (if requested)
- **Icons:** Lucide React
- **State Management:** React Context (`DiagramContext`, `AuthContext`)

## State Management (`DiagramContext`)
The heart of Loom is the `DiagramContext`, which manages the entire canvas state.
Instead of passing props deeply, the context exposes an API for creating, updating, and manipulating nodes:
- **DiagramNode:** Represents any item on the canvas (shapes, lines, text).
- **WorkspaceProject:** A collection of diagram files.
- **DiagramFile:** A specific canvas with its own nodes and background configuration.

## Authentication (`AuthContext`)
Loom delegates all authentication (login, registration, SSO) to the central `arqulat_auth` service.
- **Cookie-Based:** Upon successful SSO login on `accounts.arqulat.com`, a `.arqulat.com` scoped `arqulat_session` cookie is set.
- **Cross-Service:** Loom's `AuthContext` simply verifies if this cookie exists by making a call to the `arqulat_auth` backend. If valid, the user is authenticated.

## Canvas Mechanics
Loom does not use an external canvas library like Fabric.js; it builds an SVG/DOM-based infinite canvas manually to maintain total control over interactions, panning, zooming, and node customization. Nodes are rendered absolutely positioned based on the context state.
