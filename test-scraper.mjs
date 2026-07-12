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

  console.log(JSON.stringify({ releases }, null, 2))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
