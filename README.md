# Loom - Professional Diagramming Tool

Loom is a high-performance, professional-grade diagramming application built with React and TypeScript. It features a modern, "Figma-like" interface designed for rapid prototyping, flowcharting, and collaboration, supercharged by an embedded Antigravity-style AI Agent.

## Key Features

- **Antigravity AI Design Agent**: A sleek, fully integrated AI chat panel featuring:
  - Speech-to-Text capability via the native Web Speech API with dynamic pulse animations.
  - Model selection dropdowns (Loom GPT-4, Claude 3.5, Gemini Pro).
  - Center-screen Portal Modal for browsing chat history.
  - Auto-expanding inputs and distinct visual message bubbles.
- **Robust History System**: Reliable Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z) tracking all major canvas interactions.
- **Categorized Element Library**: Wide variety of shapes grouped into Basic (Rectangles, Circles, Stars, Pills), Flowchart (Diamonds, Hexagons, Databases, Notes), and Connectors (Lines, Arrows). Built using custom, handcrafted SVGs for pixel-perfect line weights.
- **Live Drawing Previews**: Highly responsive visual feedback (dashed bounds) rendered instantly while dragging mouse to create shapes.
- **Floating Toolbar UI**: Modern, centered toolbar design with side-by-side categorized lists and a decoupled contextual Comment tool.
- **Smart Layer Management**: Reorderable layers with representative icons for complex project organization.
- **Flexible Export/Import**: Full support for saving and loading diagrams via JSON.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, React RND.
- **Backend**: Spring Boot (Java) with Spring AI integration (WebFlux).

## Getting Started

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Build for production: `npm run build`

### Backend
1. Navigate to the `backend` directory.
2. Run the application using Maven: `./mvnw spring-boot:run`

---
*Built with precision for architects, designers, and developers.*
