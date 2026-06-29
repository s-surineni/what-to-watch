import { useState, useEffect } from 'react'
import { fetchTrending } from '../api/tmdb'

export function useReleases(language = 'en') {
  const [movies, setMovies] = useState([])
  const [tvShows, setTvShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [movieData, tvData] = await Promise.all([
          fetchTrending('movie'),
          fetchTrending('tv')
        ])
        if (!cancelled) {
          const filtered = (items) =>
            language === 'all'
              ? items
              : items.filter(item => item.language === language)

          setMovies(filtered(movieData))
          setTvShows(filtered(tvData))
          setLastUpdated(new Date().toISOString())
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [language])

  return { movies, tvShows, loading, error, lastUpdated }
}
