const TRAKT_BASE = 'https://api.trakt.tv'

export async function fetchTrending(mediaType = 'movie') {
  const clientId = import.meta.env.VITE_TRAKT_CLIENT_ID
  if (!clientId) {
    throw new Error('Missing VITE_TRAKT_CLIENT_ID in .env')
  }

  const type = mediaType === 'tv' ? 'shows' : 'movies'
  const res = await fetch(`${TRAKT_BASE}/${type}/trending?extended=images`, {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': clientId
    }
  })

  if (!res.ok) throw new Error(`Trakt error: ${res.status}`)
  const data = await res.json()
  return data.map(item => normalizeTraktItem(item, mediaType))
}

function normalizeTraktItem(item, mediaType) {
  const wrapper = mediaType === 'tv' ? item.show : item.movie
  const poster = wrapper.images?.poster?.[0]
  const fanart = wrapper.images?.fanart?.[0]

  return {
    id: wrapper.ids?.trakt,
    title: wrapper.title,
    name: wrapper.title,
    posterPath: poster,
    posterUrl: poster ? poster : null,
    backdropPath: fanart,
    overview: wrapper.overview,
    voteAverage: wrapper.rating ? Math.round(wrapper.rating * 10) / 10 : null,
    releaseDate: mediaType === 'tv' ? (wrapper.first_aired || '') : (wrapper.released || ''),
    mediaType,
    popularity: item.watchers || 0,
    genreIds: []
  }
}
