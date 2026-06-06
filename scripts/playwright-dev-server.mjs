/* eslint-disable unicorn/no-process-exit -- Playwright needs this CLI wrapper to stop the Vite dev server on Windows. */
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const port = process.argv[2] ?? process.env.PORT ?? '3000'
const viteCliPath = path.resolve('node_modules', 'vite', 'bin', 'vite.js')

process.env.VITE_POKER0MATIC_FIREBASE_MOCK = '1'
process.env.VITE_POKER0MATIC_E2E = '1'
process.once('SIGTERM', () => {
  process.exit(0)
})
process.once('SIGINT', () => {
  process.exit(0)
})
process.stdin.on('end', () => {
  process.exit(0)
})
process.stdin.on('close', () => {
  process.exit(0)
})
process.argv = [
  process.argv[0],
  viteCliPath,
  '--host',
  '127.0.0.1',
  '--port',
  port,
]

await import(pathToFileURL(viteCliPath).href)
