import { load } from 'cheerio'

const DAILYOTT_URL = 'https://www.dailyott.in/'
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w300'

const LANGUAGE_MAP = {
  english: 'en',
  hindi: 'hi',
  telugu: 'te',
  tamil: 'ta',
  malayalam: 'ml',
  kannada: 'kn',
  korean: 'ko'
}

async function searchTmdb(title, apiKey) {
  if (!apiKey) return null
  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`),
      fetch(`${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(title)}`)
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
      posterPath: best.poster_path ? `${TMDB_IMG_BASE}${best.poster_path}` : null,
      overview: best.overview || null,
      mediaType: best.media_type || (movieData.results[0] ? 'movie' : 'tv')
    }
  } catch {
    return null
  }
}

async function main() {
  const { type } = process.argv
  const mediaType = type === 'tv' ? 'tv' : 'movie'

  const response = await fetch(DAILYOTT_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; WhatToWatch/1.0)'
    }
  })

  if (!response.ok) {
    console.error(`HTTP ${response.status}`)
    process.exit(1)
  }

  const html = await response.text()
  const $ = load(html)
  const releases = []

  $('.movie-row').each((i, section) => {
    const langId = $(section).attr('id')?.replace('lang-', '') || 'unknown'
    const language = LANGUAGE_MAP[langId] || langId

    $(section).find('.movie-card').each((j, card) => {
      const $card = $(card)
      const title = $card.find('.movie-title-text').first().text().trim()
      const typeLabel = $card.find('.movie-type-label').text().trim()
      const platform = $card.find('.platform-badge').text().trim()
      const date = $card.find('.release-date').text().trim()
      const genre = $card.find('.movie-genre').text().trim()

      if (!title) return
      const isMovie = typeLabel.toLowerCase() === 'movie'
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

  // Optional TMDB enrichment
  const tmdbKey = process.env.TMDB_API_KEY
  if (tmdbKey) {
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

  console.log(JSON.stringify({ releases }, null, 2))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
