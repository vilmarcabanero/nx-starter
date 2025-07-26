# Nx Dependency Graph

This project uses Nx's dependency graph visualization to understand project relationships.

## Generating the Dependency Graph

To generate and view the dependency graph:

```bash
npm run deps:graph
```

This will create:
- `dependency-graph.html` - The main HTML file for viewing the graph
- `static/` directory - Contains generated assets (CSS, JS, etc.)

## Why These Files Are Not Committed

The `static/` directory and `dependency-graph.html` are generated files that:
- Can become outdated when project structure changes
- Add unnecessary bloat to the repository
- Should be generated fresh when needed

These files are ignored in `.gitignore` to keep the repository clean.

## Viewing the Graph

After running `npm run deps:graph`, you can:
1. Open `dependency-graph.html` in your browser
2. Use the interactive visualization to explore project dependencies

## Project Structure

Current projects in the workspace:
- **Apps**: `api`, `web`, `api-e2e`, `web-e2e`
- **Libs**: `application-core`, `domain-core`, `utils-core`