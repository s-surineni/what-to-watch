const WATCHMODE_BASE = 'https://api.watchmode.com/v1'

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

  const filtered = (data.releases || [])
    .filter(item => item.type === typeFilter)
    .map(item => normalizeWatchmodeItem(item, mediaType))

  return filtered
}

function normalizeWatchmodeItem(item, mediaType) {
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
    language: 'en',
    platform: item.source_name || null,
    isOriginal: item.is_original ? `${item.source_name} Original` : null
  }
}
