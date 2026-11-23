#!/usr/bin/env node
// Installs this project's Claude Code plugins on a teammate's machine.
//
// Runs from the SessionStart hook in .claude/settings.json, and can also be
// run by hand:  node .claude/scripts/install-plugins.mjs [--dry-run]
//
// - Installs only plugins that are missing. A plugin is treated as present
//   when one with the same name is installed from ANY source (user/project
//   scope, a different marketplace, or synced from claude.ai), so nobody
//   ends up with two copies of the same skills.
// - Never passes -y: if a marketplace wants to run its own install command,
//   that install is skipped and reported so a person can approve it.
// - Always exits 0 so a failure never blocks the Claude Code session.
// - Plugins installed here load from the NEXT session, not the current one.

import { execFileSync } from 'node:child_process'

// Keep in sync with "enabledPlugins" in .claude/settings.json.
// `source` is used only if the marketplace isn't registered yet.
const PLUGINS = [
  { id: 'superpowers@claude-plugins-official', source: 'anthropics/claude-plugins-official' },
  { id: 'frontend-design@claude-plugins-official', source: 'anthropics/claude-plugins-official' },
  { id: 'ui-ux-pro-max@ui-ux-pro-max-skill', source: 'nextlevelbuilder/ui-ux-pro-max-skill' },
  { id: 'modern-web-guidance@googlechrome', source: 'GoogleChrome/modern-web-guidance' },
]

const dryRun = process.argv.includes('--dry-run')
const nameOf = (id) => id.split('@')[0]

function claude(args) {
  // shell:true lets Windows resolve claude.cmd / claude.exe on PATH.
  // Every argument here is a fixed string from this file, never user input.
  return execFileSync('claude', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    timeout: 240_000,
  })
}

function installedNames() {
  const list = JSON.parse(claude(['plugin', 'list', '--json']))
  return new Set(list.map((p) => nameOf(p.id)))
}

function install({ id, source }) {
  const base = ['plugin', 'install', '--scope', 'project']
  try {
    claude([...base, id])
    return 'installed'
  } catch (first) {
    // Marketplace probably not registered yet (e.g. folder not trusted yet).
    try {
      claude([...base, '--marketplace', source, nameOf(id)])
      return 'installed'
    } catch (second) {
      const msg = String(second.stderr || second.message).trim().split('\n').slice(-3).join(' ')
      return `FAILED: ${msg}`
    }
  }
}

try {
  const have = installedNames()
  const missing = PLUGINS.filter((p) => !have.has(nameOf(p.id)))

  if (missing.length === 0) {
    process.exit(0) // nothing to do; stay silent so the session isn't cluttered
  }

  const results = missing.map((p) => `${p.id}: ${dryRun ? 'would install' : install(p)}`)
  console.log(
    `[project plugins] ${dryRun ? 'Dry run' : 'Set up missing plugins'}:\n  ` +
      results.join('\n  ') +
      (dryRun
        ? ''
        : '\nInstalled plugins load from the next session (restart Claude Code).' +
          '\nWhat each skill does: docs/claude-skills.md'),
  )
} catch (err) {
  console.log(`[project plugins] Skipped plugin setup: ${String(err.message).split('\n')[0]}`)
}
process.exit(0)
