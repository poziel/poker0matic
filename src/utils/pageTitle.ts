const APP_TITLE = 'Refinimo'

export function buildPageTitle (parts: Array<string | null | undefined | false>) {
  const titleParts = parts
    .map(part => typeof part === 'string' ? part.trim() : '')
    .filter(Boolean)

  return [...titleParts, APP_TITLE].join(' - ')
}

export function setPageTitle (parts: Array<string | null | undefined | false>) {
  document.title = buildPageTitle(parts)
}
