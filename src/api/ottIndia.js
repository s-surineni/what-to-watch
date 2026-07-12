const DAILYOTT_URL = 'https://www.dailyott.in/'

const LANGUAGE_MAP = {
  english: 'en',
  hindi: 'hi',
  telugu: 'te',
  tamil: 'ta',
  malayalam: 'ml',
  kannada: 'kn',
  korean: 'ko'
}

function parseDailyOtt(html, mediaType) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const releases = []
  const sections = doc.querySelectorAll('.movie-row')

  sections.forEach(section => {
    const langId = section.id?.replace('lang-', '') || 'unknown'
    const language = LANGUAGE_MAP[langId] || langId

    section.querySelectorAll('.movie-card').forEach(card => {
      const title = card.querySelector('.movie-title-text')?.textContent?.trim()
      const typeLabel = card.querySelector('.movie-type-label')?.textContent?.trim()
      const platform = card.querySelector('.platform-badge')?.textContent?.trim()
      const date = card.querySelector('.release-date')?.textContent?.trim()
      const genre = card.querySelector('.movie-genre')?.textContent?.trim()

      if (!title) return
      const isMovie = typeLabel?.toLowerCase() === 'movie'
      const itemMediaType = isMovie ? 'movie' : 'tv'

      if (mediaType !== 'all' && itemMediaType !== mediaType) return

      releases.push({
        id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${date}`,
        title,
        name: title,
        overview: genre || '',
        releaseDate: date,
        mediaType: itemMediaType,
        platform,
        language
      })
    })
  })

  return releases
}

async function searchTmdb(title, apiKey) {
  if (!apiKey) return null
  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`),
      fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(title)}`)
    ])
    const [movieData, tvData] = await Promise.all([
      movieRes.ok ? movieRes.json() : Promise.resolve({ results: [] }),
      tvRes.ok ? tvRes.json() : Promise.resolve({ results: [] })
    ])

    const best = movieData.results[0] || tvData.results[0]
    if (!best) return null

    return {
      tmdbId: best.id,
      voteAverage: best.vote_average,
      posterPath: best.poster_path ? `https://image.tmdb.org/t/p/w300${best.poster_path}` : null,
      overview: best.overview || null,
      mediaType: best.media_type || (movieData.results[0] ? 'movie' : 'tv')
    }
  } catch {
    return null
  }
}

export async function fetchReleases(mediaType = 'movie') {
  try {
    const res = await fetch(`/api/ott-india?type=${mediaType}`)
    if (res.ok) {
      const data = await res.json()
      return data.releases || []
    }
  } catch {
    // fallback to direct fetch for local/Vite dev without Vercel
  }

  const res = await fetch(DAILYOTT_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; WhatToWatch/1.0)'
    }
  })

  if (!res.ok) throw new Error(`OTT India error: ${res.status}`)
  const html = await res.text()
  const releases = parseDailyOtt(html, mediaType)

  const tmdbKey = import.meta.env.VITE_TMDB_API_KEY
  if (tmdbKey && releases.length > 0) {
    const uniqueTitles = [...new Set(releases.map(r => r.title))]
    const promises = uniqueTitles.map(title => searchTmdb(title, tmdbKey))
    const results = await Promise.all(promises)
    const cache = new Map()
    uniqueTitles.forEach((title, i) => {
      if (results[i]) cache.set(title, results[i])
    })
    for (const release of releases) {
      const data = cache.get(release.title)
      if (data) {
        release.voteAverage = data.voteAverage
        release.posterUrl = data.posterPath
      }
    }
  }

  return releases
}
