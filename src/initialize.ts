import puppeteer, { Browser, DirectNavigationOptions, Page, ResourceType } from 'puppeteer'

async function loadConfig() {
  const config = await import('../config').catch(() =>
    import('../config.default')
  )
  return config
}

export default async function initialize({ useBrowser = true } = {}) {
  const config = await loadConfig()

  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')

  let browser = undefined as Browser
  let workers = undefined as Page[]

  if (useBrowser) {
    browser = await puppeteer.launch()
    workers = await Promise.all(
      Array(config.NUMBER_OF_WORKERS)
        .fill(undefined)
        .map(() => browser.newPage())
    )

    if (config.FILTER_REQUESTS) {
      workers.forEach(async worker => {
        await worker.setRequestInterception(true)
        worker.on('request', request => {
          const types = ['font', 'image', 'stylesheet'] as ResourceType[]

          if (types.some(type => request.resourceType() === type)) {
            request.abort()
          } else {
            request.continue()
          }
        })
      })
    }
  }

  const withBrowser = useBrowser ? { browser, workers } : {}
  const workerProps = { waitUntil: 'networkidle0' } as DirectNavigationOptions

  return { config, date, ...withBrowser, workerProps }
}
