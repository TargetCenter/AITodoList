# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3-based todo task management tool that supports Markdown syntax for declaring tasks, time schedules, and task dependencies, with visualization through ECharts relationship diagrams.

## Key Technologies

- Vue 3 with Composition API
- Vite as build tool
- Element Plus for UI components
- ECharts for data visualization
- Vue Router for navigation

## Project Structure

```
src/
├── main.js              # Application entry point
├── App.vue              # Root component
├── router/              # Vue Router configuration
├── views/               # Page components
│   ├── TodoEditor.vue   # Markdown todo editor
│   └── TodoGraph.vue    # ECharts relationship visualization
├── utils/               # Utility functions
│   ├── markdownParser.js # Markdown parsing and validation
│   └── fileManager.js    # File management simulation
└── assets/              # Static assets
```

## Development Commands

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
The server will start on http://localhost:3000/ or the next available port.

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run serve
```

## Core Features

1. **Markdown Syntax Support**:
   - Task declaration with `[ ]` (incomplete) and `[x]` (complete)
   - Time specification with `@` symbol
   - Duration specification with units (h, d, m)
   - Task dependencies with `->` symbol

2. **Real-time Syntax Checking**:
   - Live Markdown syntax validation
   - Error highlighting and feedback

3. **Task Relationship Visualization**:
   - ECharts relationship graph showing task dependencies
   - Arrow directions indicate dependency flow
   - Color coding for completed/unfinished tasks

4. **File Management**:
   - Multiple todo group files support
   - Create, save, and open file functionality

## Architecture Overview

The application follows a component-based architecture with Vue 3:
- **Main Entry**: `main.js` initializes the Vue app with Element Plus and Vue Router
- **Routing**: `router/index.js` defines two routes - `/` for TodoEditor and `/graph` for TodoGraph
- **Core Views**:
  - `TodoEditor.vue`: Main editor interface with split view for Markdown editing and task preview
  - `TodoGraph.vue`: ECharts visualization of task dependencies
- **Utilities**:
  - `markdownParser.js`: Handles parsing and validation of Markdown todo syntax
  - `fileManager.js`: Simulates file storage using in-memory Map structures

## Markdown Syntax

```
- [ ] Task Name @start-time duration -> dependency
- [x] Completed Task @start-time duration -> dependency
```

Example:
```markdown
- [ ] Design database @2023-09-15 2h
- [ ] Develop API @2023-09-16 4h -> Design database
- [x] Project init @2023-09-14 1h
```