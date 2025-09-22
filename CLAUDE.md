# Project Development Guidelines for AI Coding Agent

## 1. Work Planning

### Context Files
- All markdown files in `@.claude/context-long-term/*.md` contain essential work context
- For project description, purpose, and business value: refer to `prd.md`
- For current development progress: refer to `todo.md`

## 2. Work Procedures

### Phase-based Development
- Development progress is tracked in `@.claude/context-long-term/todo.md`
- Work must proceed in Phase units
- After completing each Phase:
  - Update the todo.md file with completed work
  - Include source code locations with file paths and line numbers for each task
  - Example: `✓ Implemented score calculation - packages/core/scoring.ts:45-120`

### Progress Tracking Format
When updating todo.md, use this format:
```
- [x] Task description (file_path:line_numbers)
```

## 3. Code Development Guidelines

### Pre-coding Requirements
1. **Type Definitions First**: Define all TypeScript types in detail before implementation
2. **Code Reuse Check**: Search existing codebase for similar functionality before adding new features
3. **Pattern Consistency**: Follow existing patterns and conventions in the codebase

## 4. Documentation Standards

### For NEW Code
Add JSDoc documentation at module → class → function levels

**Required JSDoc Content:**
- Purpose and usage location (e.g., "Used in frontend ResultCard component for score visualization")
- Searchable tags for functionality discovery
  - Example for novel analysis feature: `@tags llm, question-generation, analyze-text, gemini-api`

**JSDoc Template:**
```typescript
/**
 * Brief description of the function/class/module
 * 
 * @description Detailed explanation of purpose and usage context
 * Used in: [Component/Service name] for [specific purpose]
 * 
 * @tags tag1, tag2, tag3
 */
```

**Do NOT Include:**
- Input/output parameter descriptions (TypeScript types provide this information)
- Redundant type information

### For EXISTING Code Modifications
Update JSDoc documentation in order: function → class → module
- Ensure documentation reflects the modified functionality
- Update tags if functionality scope changes
- Maintain consistency with the new implementation

## 5. Development Workflow

1. Check `todo.md` for current Phase tasks
2. Review existing codebase before implementing new features
3. Define types thoroughly
4. Implement with proper JSDoc documentation
5. Update `todo.md` with completion status and code locations
6. Proceed to next Phase after all current Phase tasks are complete

## 6. Critical Reminders

- Always reference `.claude/context-long-term/` files for project context
- Maintain atomic commits per feature/fix
- Follow the monorepo structure (apps/, packages/)
- Use pnpm workspace commands for package management
- Test features in isolation before integration