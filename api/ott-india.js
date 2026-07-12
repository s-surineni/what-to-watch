import { load } from 'cheerio'

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
          isOriginal: null
        })
      })
    })

    return res.status(200).json({ releases })
  } catch (error) {
    console.error('Scraper error:', error)
    return res.status(500).json({
      error: 'Failed to fetch releases',
      message: error.message
    })
  }
}
