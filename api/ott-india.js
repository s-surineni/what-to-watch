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
    if (!movieRes.ok && !tvRes.ok) return null

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type } = req.query
  const mediaType = type === 'tv' ? 'tv' : 'movie'
  const tmdbApiKey = process.env.TMDB_API_KEY

  try {
    const response = await fetch(DAILYOTT_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WhatToWatch/1.0; +https://github.com/sampathweb/what-to-watch)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
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
          language,
          posterPath: null,
          posterUrl: null,
          backdropPath: null,
          voteAverage: null,
          popularity: 0,
          genreIds: [],
          isOriginal: null,
          tmdbData: null
        })
      })
    })

    const uniqueTitles = [...new Set(releases.map(r => r.title))]
    const tmdbCache = new Map()

    if (tmdbApiKey) {
      const tmdbPromises = uniqueTitles.slice(0, 50).map(async (title) => {
        const data = await searchTmdb(title, tmdbApiKey)
        tmdbCache.set(title.toLowerCase(), data)
        return data
      })
      await Promise.all(tmdbPromises)

      for (const release of releases) {
        const data = tmdbCache.get(release.title.toLowerCase())
        if (data) {
          release.voteAverage = data.voteAverage
          release.posterUrl = data.posterPath
          release.backdropPath = null
          release.tmdbData = {
            id: data.tmdbId,
            vote_average: data.voteAverage,
            media_type: data.mediaType,
            overview: data.overview
          }
        }
      }
    }

    return res.status(200).json({ releases })
  } catch (error) {
    console.error('Scraper error:', error)
    return res.status(500).json({
      error: 'Failed to fetch releases',
      message: error.message
    })
  }
}
