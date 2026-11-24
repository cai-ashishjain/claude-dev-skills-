# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

## Claude Code plugins (optional)

This project recommends four Claude Code plugins: `superpowers`, `frontend-design`,
`ui-ux-pro-max` and `modern-web-guidance`. **Installing them is up to you.** The project
works the same without them, and nothing is installed unless you say so.

**What each skill does and how to use it:** [docs/claude-skills.md](docs/claude-skills.md)

### How it works

1. Open Claude Code in this folder and accept the "trust this folder" prompt.
2. At session start you'll see a one-line offer listing the plugins you don't have.
3. Choose, in a terminal in this folder:

   | Command | What it does |
   |---|---|
   | `node .claude/scripts/install-plugins.mjs install` | installs the missing plugins (about a minute), and installs any added to the team list later |
   | `node .claude/scripts/install-plugins.mjs skip` | installs nothing and turns the offer off |
   | `node .claude/scripts/install-plugins.mjs status` | shows your choice and what's installed |
   | `node .claude/scripts/install-plugins.mjs reset` | forgets your choice, so you're asked again |

4. If you installed, restart Claude Code. The plugins load from the next session.

Your choice and the plugins apply to **you, in this project only**. They're stored in the
git-ignored `.claude/team-plugins.local` and `.claude/settings.local.json`. To remove a
plugin later: `claude plugin uninstall <name> --scope local`.

### Prerequisites

| Need | Why | Check |
|---|---|---|
| **Node.js** | runs the setup script (you already need it for this Vite app) | `node --version` |
| **Python 3** (no extra packages) | only if you install `ui-ux-pro-max`: it uses Python to search its built-in styles, palettes and UX rules | `python --version` should print `Python 3.x` |

Installing Python on Windows: `winget install Python.Python.3.12`, then open a new terminal.
On Windows, `python` can print "Python was not found" even though the command exists.
That means Python is **not** installed. Without Python, everything else still works;
if you installed the plugins, a one-line reminder shows at session start until Python is installed.

### Notes

- If you already have one of these plugins from another source (for example
  `superpowers` synced from claude.ai), it is not installed again.
- To recommend another plugin to the team, add it to the `PLUGINS` list in
  `.claude/scripts/install-plugins.mjs` (and its marketplace to `extraKnownMarketplaces`
  in `.claude/settings.json` if it's a new one), then add it to `docs/claude-skills.md`.
