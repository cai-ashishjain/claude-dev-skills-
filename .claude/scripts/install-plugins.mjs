#!/usr/bin/env node
// Optional setup for this project's Claude Code plugins.
//
//   node .claude/scripts/install-plugins.mjs install   install missing plugins (and keep them up to date with this list)
//   node .claude/scripts/install-plugins.mjs skip      don't install, and stop the reminder
//   node .claude/scripts/install-plugins.mjs status    show what's installed / missing and your choice
//   node .claude/scripts/install-plugins.mjs reset     forget your choice (the reminder comes back)
//
// The SessionStart hook in .claude/settings.json runs this with --hook:
//   - no choice yet + plugins missing -> prints a short offer, installs nothing
//   - chose "install"                 -> installs any missing plugins
//   - chose "skip"                    -> silent
//
// Your choice is stored in .claude/team-plugins.local (git-ignored, per machine).
// Plugins are installed with --scope local, i.e. recorded in your git-ignored
// .claude/settings.local.json, so they affect only you and only this project.
//
// A plugin counts as present when one with the same name is installed from ANY
// source (another marketplace, user scope, or synced from claude.ai), so nobody
// gets two copies. Never passes -y: a marketplace that wants to run its own
// install command is reported for a person to approve. Always exits 0 so it
// never blocks a Claude Code session.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The team's plugins. `source` is used only if the marketplace isn't registered yet.
const PLUGINS = [
  { id: 'superpowers@claude-plugins-official', source: 'anthropics/claude-plugins-official' },
  { id: 'frontend-design@claude-plugins-official', source: 'anthropics/claude-plugins-official' },
  { id: 'ui-ux-pro-max@ui-ux-pro-max-skill', source: 'nextlevelbuilder/ui-ux-pro-max-skill' },
  { id: 'modern-web-guidance@googlechrome', source: 'GoogleChrome/modern-web-guidance' },
]

const SCRIPT = 'node .claude/scripts/install-plugins.mjs'
const PROJECT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const CHOICE_FILE = path.join(PROJECT_DIR, '.claude', 'team-plugins.local')
const TAG = '[team plugins]'

const nameOf = (id) => id.split('@')[0]

function claude(args) {
  // shell:true lets Windows resolve claude.cmd / claude.exe on PATH.
  // Every argument here is a fixed string from this file, never user input.
  return execFileSync('claude', args, {
    cwd: PROJECT_DIR, // --scope local writes to this project's .claude/settings.local.json
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    timeout: 240_000,
  })
}

function readChoice() {
  try {
    const v = fs.readFileSync(CHOICE_FILE, 'utf8').trim()
    return v === 'install' || v === 'skip' ? v : null
  } catch {
    return null
  }
}

function writeChoice(v) {
  if (v === null) fs.rmSync(CHOICE_FILE, { force: true })
  else fs.writeFileSync(CHOICE_FILE, v + '\n')
}

function installedNames() {
  const list = JSON.parse(claude(['plugin', 'list', '--json']))
  return new Set(list.map((p) => nameOf(p.id)))
}

function install({ id, source }) {
  const base = ['plugin', 'install', '--scope', 'local']
  try {
    claude([...base, id])
    return 'installed'
  } catch {
    // Marketplace probably not registered yet (e.g. folder not trusted yet).
    try {
      claude([...base, '--marketplace', source, nameOf(id)])
      return 'installed'
    } catch (err) {
      const msg = String(err.stderr || err.message).trim().split('\n').slice(-3).join(' ')
      return `FAILED: ${msg}`
    }
  }
}

// ui-ux-pro-max runs Python 3 scripts (no extra packages) for its style,
// palette and UX-rule search. Each candidate is actually run, because on
// Windows `python` can be a Microsoft Store placeholder that exists but only
// prints "Python was not found".
function hasPython3() {
  const candidates = [['python', '--version'], ['python3', '--version'], ['py', '-3', '--version']]
  return candidates.some(([cmd, ...args]) => {
    try {
      const out = execFileSync(cmd, args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 10_000,
      })
      return /^Python 3\./.test(out.trim())
    } catch {
      return false
    }
  })
}

function installMissing(missing) {
  const results = missing.map((p) => `${p.id}: ${install(p)}`)
  return (
    `${TAG} Installed missing plugins:\n  ${results.join('\n  ')}\n` +
    'They load from the next session (restart Claude Code). What each skill does: docs/claude-skills.md'
  )
}

const PYTHON_NOTE =
  `${TAG} Python 3 not found. ui-ux-pro-max skills still give advice, but their ` +
  'style/palette/UX-rule search will not run. Install Python 3 (Windows: ' +
  '`winget install Python.Python.3.12`), then restart Claude Code. See README > Prerequisites.'

const args = process.argv.slice(2)
const mode = args.includes('--hook') ? 'hook' : args[0] || 'status'
const out = []

try {
  const have = installedNames()
  const missing = PLUGINS.filter((p) => !have.has(nameOf(p.id)))
  const choice = readChoice()

  switch (mode) {
    case 'hook':
      if (missing.length > 0 && choice === 'install') out.push(installMissing(missing))
      else if (missing.length > 0 && choice === null)
        out.push(
          `${TAG} Optional: this project recommends ${missing.length} Claude Code plugin(s) you don't have: ` +
            `${missing.map((p) => nameOf(p.id)).join(', ')}. ` +
            `Install: \`${SCRIPT} install\` · No thanks: \`${SCRIPT} skip\` · Details: docs/claude-skills.md`,
        )
      break

    case 'install':
      writeChoice('install')
      out.push(missing.length > 0 ? installMissing(missing) : `${TAG} All team plugins are already installed.`)
      break

    case 'skip':
      writeChoice('skip')
      out.push(
        `${TAG} OK, not installing. The reminder is off for this project on this machine. ` +
          `Change your mind any time: \`${SCRIPT} install\`.`,
      )
      break

    case 'reset':
      writeChoice(null)
      out.push(`${TAG} Choice cleared. You'll be asked again at the next session start.`)
      break

    case 'status':
      out.push(
        `${TAG} Your choice: ${choice ?? 'not decided yet'}`,
        ...PLUGINS.map((p) => `  ${have.has(nameOf(p.id)) ? 'installed' : 'missing  '}  ${nameOf(p.id)}`),
      )
      break

    default:
      out.push(`${TAG} Unknown command "${mode}". Use: install | skip | status | reset`)
  }

  // Only mention Python to people who have ui-ux-pro-max (or just installed it).
  const wantsUiUx = have.has('ui-ux-pro-max') || choice === 'install' || mode === 'install'
  if (wantsUiUx && mode !== 'skip' && mode !== 'reset' && !hasPython3()) out.push(PYTHON_NOTE)
} catch (err) {
  out.push(`${TAG} Skipped plugin check: ${String(err.message).split('\n')[0]}`)
}

if (out.length > 0) console.log(out.join('\n'))
process.exit(0)
