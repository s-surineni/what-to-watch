const WATCHMODE_BASE = 'https://api.watchmode.com/v1'

const LANGUAGE_CACHE_KEY = 'watchmode_lang_cache'
const LANGUAGE_CACHE_TTL = 7 * 24 * 60 * 60 * 1000

function loadLangCache() {
  try {
    const raw = localStorage.getItem(LANGUAGE_CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    const now = Date.now()
    const cleaned = {}
    for (const [id, entry] of Object.entries(parsed)) {
      if (entry.ts && now - entry.ts < LANGUAGE_CACHE_TTL) {
        cleaned[id] = entry
      }
    }
    return cleaned
  } catch {
    return {}
  }
}

function saveLangCache(cache) {
  try {
    localStorage.setItem(LANGUAGE_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // ignore storage errors
  }
}

export async function fetchReleases(mediaType = 'movie') {
  const apiKey = import.meta.env.VITE_WATCHMODE_API_KEY
  if (!apiKey) {
    throw new Error('Missing VITE_WATCHMODE_API_KEY in .env')
  }

  const typeFilter = mediaType === 'tv' ? 'tv_series' : 'movie'
  const url = `${WATCHMODE_BASE}/releases/?apiKey=${apiKey}&limit=100`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Watchmode error: ${res.status}`)
  const data = await res.json()

  const releases = (data.releases || [])
    .filter(item => item.type === typeFilter)

  const langCache = loadLangCache()
  const uncached = releases.filter(item => !langCache[String(item.id)])

  if (uncached.length > 0) {
    const detailPromises = uncached.slice(0, 50).map(async item => {
      try {
        const detailRes = await fetch(`${WATCHMODE_BASE}/title/${item.id}/details/?apiKey=${apiKey}`)
        if (!detailRes.ok) return { id: String(item.id), language: 'en' }
        const detailData = await detailRes.json()
        const lang = detailData.original_language || 'en'
        return { id: String(item.id), language: lang }
      } catch {
        return { id: String(item.id), language: 'en' }
      }
    })

    const results = await Promise.all(detailPromises)
    for (const r of results) {
      langCache[r.id] = { language: r.language, ts: Date.now() }
    }
    saveLangCache(langCache)
  }

  const finalReleases = releases.map(item => {
    const cached = langCache[String(item.id)]
    return normalizeWatchmodeItem(item, mediaType, cached?.language || 'en')
  })

  return finalReleases
}

function normalizeWatchmodeItem(item, mediaType, language) {
  return {
    id: item.id,
    title: item.title,
    name: item.title,
    posterPath: item.poster_url,
    posterUrl: item.poster_url,
    backdropPath: null,
    overview: '',
    voteAverage: null,
    releaseDate: item.source_release_date || '',
    mediaType,
    popularity: 0,
    genreIds: [],
    language: language || 'en',
    platform: item.source_name || null,
    isOriginal: item.is_original ? `${item.source_name} Original` : null
  }
}
