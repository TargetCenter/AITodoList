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

## Monaco Editor Configuration

Monaco Editor is configured with disabled workers to avoid 404 errors. The editor supports:
- Custom "todo-markdown" language with syntax highlighting
- Multiple themes (vs, vs-dark, todo-light, todo-dark)
- IntelliSense completions, hover information, and validation

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