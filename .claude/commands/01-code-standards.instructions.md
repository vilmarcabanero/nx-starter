# Code Standards & Consistency

## Primary Rule: Follow Existing Codebase Patterns
**Always analyze the existing codebase first and match its patterns, conventions, and style.**

## Code Analysis Approach
1. **Before writing any code**: Examine existing files in the same project/directory
2. **Pattern Detection**: Identify consistent patterns in:
   - Variable naming conventions (camelCase, snake_case, PascalCase)
   - Function/method structure and organization
   - Import/export patterns
   - File organization and directory structure
   - Comment styles and documentation patterns
   - Error handling approaches
   - Testing patterns and naming

## Language-Specific Consistency

### JavaScript/TypeScript
- Use TypeScript strict mode and proper type definitions
- Match existing naming conventions (camelCase vs snake_case)
- Follow existing import organization (grouped, alphabetical, etc.)
- Use same quote style (single vs double quotes)
- Match indentation (tabs vs spaces, 2 vs 4 spaces)
- Follow existing function declaration style (function vs arrow functions)
- Match existing type annotation patterns in TypeScript
- Add JSDoc comments for functions and complex logic

## General Principles
- **Consistency over personal preference**: Use project's existing style even if different from standard conventions
- **When in doubt**: Look for the most common pattern in the codebase
- **New patterns**: Only introduce new patterns when absolutely necessary and document the reason
- **Gradual improvements**: Don't refactor existing code unless specifically requested

## Implementation Guidelines
- Read at least 3-5 similar files before writing new code
- Match the complexity level of existing code (don't over-engineer if codebase is simple)
- Use existing utility functions and patterns rather than creating new ones
- Follow existing project structure and module organization
- Maintain consistency in error messages and logging patterns
- Use clean code principles with clear variable names
- Use consistent formatting and indentation

## When No Clear Pattern Exists
If the codebase lacks clear patterns or is inconsistent:
1. Follow the most recent/modern examples in the codebase
2. Use widely accepted industry standards for the language/framework
3. Prioritize readability and maintainability
4. Document the chosen approach for future consistency
