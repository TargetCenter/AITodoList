# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3-based todo task management tool that supports Markdown syntax for declaring tasks, time schedules, and task dependencies, with visualization through ECharts relationship diagrams. The application has been enhanced with Monaco Editor for a better editing experience.

## Key Technologies

- Vue 3 with Composition API
- Vite as build tool
- Element Plus for UI components
- ECharts for data visualization
- Vue Router for navigation
- Monaco Editor as the code editor
- LocalStorage for data persistence

## Project Structure

```
src/
├── main.js              # Application entry point
├── App.vue              # Root component
├── router/              # Vue Router configuration
├── views/               # Page components
│   ├── TodoEditor.vue   # Markdown todo editor with Monaco Editor
│   └── TodoGraph.vue    # ECharts relationship visualization
├── components/          # Reusable components
│   ├── MonacoEditor.vue # Monaco Editor component with custom language support
│   └── AIAssistant.vue  # AI assistant component
├── utils/               # Utility functions
│   ├── markdownParser.js # Markdown parsing and validation
│   ├── fileManager.js    # File management with localStorage persistence
│   ├── todoLanguage.js   # Custom Monaco language definition for todo-markdown
│   ├── todoCompletion.js # Monaco completion provider for todo syntax
│   ├── todoHover.js      # Monaco hover provider for todo syntax
│   └── todoValidation.js # Monaco validation provider for todo syntax
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

1. **Enhanced Markdown Syntax Support**:
   - Task declaration with `[ ]` (incomplete) and `[x]` (complete)
   - Time specification with `@` symbol
   - Duration specification with units (h, d, m)
   - Task dependencies with `->` symbol

2. **Monaco Editor Integration**:
   - Custom "todo-markdown" language with syntax highlighting
   - IntelliSense with auto-completion for todo syntax
   - Hover information for syntax elements
   - Real-time syntax validation with error markers
   - Multiple themes including custom "todo-light" and "todo-dark"

3. **Real-time Syntax Checking**:
   - Live Markdown syntax validation
   - Error highlighting and feedback in the editor
   - Detailed error messages with line numbers

4. **Task Relationship Visualization**:
   - ECharts relationship graph showing task dependencies
   - Arrow directions indicate dependency flow
   - Color coding for completed/unfinished tasks
   - Node size based on task duration
   - Interactive tooltips with task details

5. **File Management**:
   - Multiple todo group files support
   - Create, save, open, delete, and export/import functionality
   - localStorage persistence for all files
   - File change tracking with automatic saving

6. **Mobile-friendly Task Interaction**:
   - Swipe gestures to complete tasks on mobile devices
   - Responsive design for all screen sizes

## Architecture Overview

The application follows a component-based architecture with Vue 3:

- **Main Entry**: `main.js` initializes the Vue app with Element Plus and Vue Router
- **Routing**: `router/index.js` defines routes for `/` (TodoEditor), `/graph` (TodoGraph), and `/test` (APITest)
- **Core Views**:
  - `TodoEditor.vue`: Main editor interface with Monaco Editor for editing and split view for task preview
  - `TodoGraph.vue`: ECharts visualization of task dependencies
- **Components**:
  - `MonacoEditor.vue`: Custom Monaco Editor component with todo-markdown language support
  - `AIAssistant.vue`: AI assistant component for task suggestions
- **Utilities**:
  - `markdownParser.js`: Handles parsing and validation of Markdown todo syntax
  - `fileManager.js`: Manages file storage using localStorage
  - `todoLanguage.js`: Defines custom language grammar for Monaco Editor
  - `todoCompletion.js`: Provides IntelliSense completions for todo syntax
  - `todoHover.js`: Provides hover information for todo syntax elements
  - `todoValidation.js`: Provides real-time syntax validation for todo syntax

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