/* eslint-disable unicorn/no-process-exit -- This file is a CLI wrapper. */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const rulerDir = path.join(projectRoot, '.ruler')
const configPath = path.join(rulerDir, 'ruler.toml')
const explicitEnvPath = process.env.RULER_ENV_FILE
  ? path.resolve(projectRoot, process.env.RULER_ENV_FILE)
  : null
const activeMode = process.env.RULER_ENV || process.env.MODE || process.env.NODE_ENV || ''

/**
 * Loads simple KEY=VALUE pairs from a dotenv-style file.
 *
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
function loadEnvFile (filePath) {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  const env = {}
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/u)

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmedLine.slice(0, separatorIndex).trim()
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
    const unquotedValue = rawValue.replace(/^(['"])(.*)\1$/u, '$2')

    env[key] = unquotedValue
  }

  return env
}

/**
 * Resolves env files from `.ruler/` using project-style naming:
 * `.env`, `.env.local`, `.env.<mode>`, `.env.<mode>.local`.
 *
 * `RULER_ENV_FILE` still wins when an explicit path is provided.
 *
 * @param {string} rootDir
 * @param {string | null} filePath
 * @param {string} mode
 * @returns {{ env: Record<string, string>, loadedFiles: string[] }}
 */
function loadResolvedEnv (rootDir, filePath, mode) {
  if (filePath) {
    return {
      env: loadEnvFile(filePath),
      loadedFiles: fs.existsSync(filePath) ? [filePath] : [],
    }
  }

  const candidatePaths = [
    path.join(rootDir, '.ruler', '.env'),
    path.join(rootDir, '.ruler', '.env.local'),
  ]

  if (mode) {
    candidatePaths.push(
      path.join(rootDir, '.ruler', `.env.${mode}`),
      path.join(rootDir, '.ruler', `.env.${mode}.local`),
    )
  }

  const env = {}
  const loadedFiles = []

  for (const candidatePath of candidatePaths) {
    if (!fs.existsSync(candidatePath)) {
      continue
    }

    Object.assign(env, loadEnvFile(candidatePath))
    loadedFiles.push(candidatePath)
  }

  return { env, loadedFiles }
}

/**
 * Replaces `${VAR_NAME}` placeholders inside `ruler.toml` with values from
 * resolved project env files first, then falls back to the current shell
 * environment.
 *
 * @param {string} template
 * @param {Record<string, string>} env
 * @returns {{ resolved: string, missing: string[] }}
 */
function resolvePlaceholders (template, env) {
  const missing = new Set()

  const resolved = template.replace(/\$\{([A-Z0-9_]+)\}/gu, (_, variableName) => {
    const value = env[variableName]

    if (typeof value !== 'string' || value.length === 0) {
      missing.add(variableName)
      return `\${${variableName}}`
    }

    return value
  })

  return {
    resolved,
    missing: [...missing],
  }
}

const { env: fileEnv, loadedFiles } = loadResolvedEnv(projectRoot, explicitEnvPath, activeMode)
const combinedEnv = {
  ...process.env,
  ...fileEnv,
}

const template = fs.readFileSync(configPath, 'utf8')
const { resolved, missing } = resolvePlaceholders(template, combinedEnv)

if (missing.length > 0) {
  let resolvedSourceHint = explicitEnvPath || loadedFiles.join(', ')

  if (!resolvedSourceHint) {
    const candidatePaths = [
      path.join(projectRoot, '.ruler', '.env'),
      path.join(projectRoot, '.ruler', '.env.local'),
    ]

    if (activeMode) {
      candidatePaths.push(
        path.join(projectRoot, '.ruler', `.env.${activeMode}`),
        path.join(projectRoot, '.ruler', `.env.${activeMode}.local`),
      )
    }

    resolvedSourceHint = candidatePaths.join(', ')
  }

  console.error(
    `Missing Ruler secret values: ${missing.join(', ')}.\n`
    + `Add them to ${resolvedSourceHint} or export them in your shell environment.`,
  )
  process.exit(1)
}

const localRulerCliPath = path.join(
  projectRoot,
  'node_modules',
  '@intellectronica',
  'ruler',
  'dist',
  'cli',
  'index.js',
)
const useLocalRulerCli = fs.existsSync(localRulerCliPath)
const command = useLocalRulerCli ? process.execPath : 'npx'
const rulerArgs = useLocalRulerCli
  ? [
      localRulerCliPath,
      'apply',
      ...process.argv.slice(2),
    ]
  : [
      '@intellectronica/ruler',
      'apply',
      ...process.argv.slice(2),
    ]

fs.writeFileSync(configPath, resolved, 'utf8')

const result = spawnSync(command, rulerArgs, {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: !useLocalRulerCli && process.platform === 'win32',
})

try {
  fs.writeFileSync(configPath, template, 'utf8')
} catch {
  console.error(`Failed to restore ${configPath}. Restore it from version control before committing.`)
  process.exit(1)
}

process.exit(result.status ?? 1)
