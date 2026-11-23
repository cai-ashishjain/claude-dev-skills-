# Claude Code skills in this repo

After setup (see the README), you have 4 plugins with 25 skills.
**You don't need to learn them.** Claude picks the right skill on its own when your
request matches it. This page is for when you want to know what's there or call one
directly.

## How to use a skill

- **Just ask normally.** "Fix this failing test" makes Claude reach for
  `systematic-debugging`; "build a settings page" pulls in the design skills.
- **Call one by name:** type `/` in Claude Code to see them all, or run one directly,
  e.g. `/superpowers:brainstorming`.
- **Check what's installed:** `/plugin` (Installed tab), or `claude plugin list` in a terminal.

## Start here: the 5 most useful

| Skill | Use it when you want to… | Try |
|---|---|---|
| `/superpowers:brainstorming` | think a feature through before building it | "Let's brainstorm a dark-mode toggle" |
| `/superpowers:systematic-debugging` | find the real cause of a bug instead of guessing | "This test fails sometimes, find out why" |
| `/frontend-design:frontend-design` | make new UI look intentional, not like a template | "Redesign the landing page" |
| `/modern-web-guidance:modern-web-guidance` | use current HTML/CSS/JS practices (dialogs, forms, a11y, performance) | "Add an accessible modal" |
| `/superpowers:verification-before-completion` | make Claude prove it works before saying "done" | "Verify the build passes before committing" |

Everything below is reference. Skim the plugin you need.

---

<details>
<summary><b>superpowers</b>: a disciplined dev workflow (plan → build → verify) · 15 skills</summary>

| Skill | When it's used |
|---|---|
| `brainstorming` | Before creating or changing anything: clarifies the idea first |
| `writing-plans` | Turning requirements into a step-by-step plan |
| `executing-plans` | Carrying out a plan yourself in this session |
| `subagent-driven-development` | Carrying out a plan by handing independent tasks to subagents |
| `dispatching-parallel-agents` | Two or more independent tasks that can run at once |
| `test-driven-development` | Writing a feature or bugfix test-first |
| `systematic-debugging` | Any bug, failing test or odd behavior, before proposing a fix |
| `verification-before-completion` | Before claiming something is fixed, done or passing |
| `requesting-code-review` | After a feature, before merging |
| `receiving-code-review` | Acting on review feedback critically, not blindly |
| `using-git-worktrees` | Working on a feature in an isolated checkout |
| `finishing-a-development-branch` | Deciding how to merge or wrap up a finished branch |
| `writing-skills` | Creating or editing your own skills |
| `using-superpowers` | Loaded at session start; teaches Claude to use the skills above |
| `diagnosing-superpowers` | Working out why a session went wrong (slow, ignored plan, skill didn't fire) |

</details>

<details>
<summary><b>frontend-design</b>: distinctive visual design · 1 skill</summary>

| Skill | When it's used |
|---|---|
| `frontend-design` | Building or reshaping UI: aesthetic direction, typography, avoiding generic defaults |

</details>

<details>
<summary><b>ui-ux-pro-max</b>: UI/UX reference data and design production · 7 skills</summary>

| Skill | When it's used |
|---|---|
| `ui-ux-pro-max` | Designing, building or reviewing interfaces; searches built-in styles, palettes, font pairings and UX guidelines |
| `ui-styling` | Building UI with shadcn/ui + Tailwind (components, responsive layouts, dark mode) |
| `design-system` | Design tokens (primitive → semantic → component) and component specs |
| `brand` | Brand voice, visual identity, style guides |
| `design` | Logos, icons, corporate identity, social images *(image generation needs setup, see below)* |
| `banner-design` | Banners for social media, ads, website heroes and print |
| `slides` | HTML presentations with charts |

</details>

<details>
<summary><b>modern-web-guidance</b>: up-to-date web platform practices (from Google Chrome) · 2 skills</summary>

| Skill | When it's used |
|---|---|
| `modern-web-guidance` | Any HTML/CSS/client-side JS work: modals, forms, accessibility, dark mode, Core Web Vitals, security |
| `chrome-extensions` | Building, debugging or publishing a Chrome extension (Manifest V3) |

</details>

---

## Extra setup some skills need

- **Python 3**: required by `ui-ux-pro-max` (its style/palette search), and used by
  `design`, `design-system` and `ui-styling`. Without it, Claude can still give advice,
  but the built-in search won't run. Check with `python --version`.
- **Image generation in `design`** (logos, icons): needs an API key such as
  `GEMINI_API_KEY` plus `pip install google-genai pillow`. Optional; skip it unless you need
  generated images. Never commit API keys.
- Everything else works with no extra setup.

## Notes

- Skills don't apply until the plugins are installed and Claude Code has been restarted
  once (see the README).
- Your own claude.ai account skills and Claude Code's built-in commands (e.g. `/code-review`)
  are separate and not listed here.
- Skill lists are from the plugin versions installed on 2026-11-23 (superpowers 7.0.2,
  ui-ux-pro-max 2.15.0, modern-web-guidance 1.0.1, frontend-design 1.1.1). Newer versions
  may add or rename skills; `/` in Claude Code always shows the current list.
