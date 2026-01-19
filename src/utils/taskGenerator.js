export function generateTaskMarkdown(params) {
  const parts = []

  parts.push('- [ ]')

  if (params.title) {
    parts.push(params.title)
  }

  if (params.duration) {
    parts.push(`⏱ ${params.duration}`)
  }

  if (params.dependencies) {
    parts.push(`📋 ${params.dependencies}`)
  }

  if (params.startTime) {
    parts.push(`📅 ${params.startTime}`)
  }

  return parts.join(' ')
}

export function parseTaskParams(markdown) {
  const params = {
    title: '',
    dependencies: '',
    duration: '',
    startTime: ''
  }

  const durationMatch = markdown.match(/⏱\s*([^\s📋📅]+)/)
  if (durationMatch) {
    params.duration = durationMatch[1].trim()
  }

  const depsMatch = markdown.match(/📋\s*([^\s⏱📅]+)/)
  if (depsMatch) {
    params.dependencies = depsMatch[1].trim()
  }

  const timeMatch = markdown.match(/📅\s*([^\s⏱📋]+)/)
  if (timeMatch) {
    params.startTime = timeMatch[1].trim()
  }

  const titleMatch = markdown.match(/^-\s*\[\s*\]\s*(.+?)(?:\s*⏱|$)/)
  if (titleMatch) {
    params.title = titleMatch[1].trim()
  }

  return params
}
