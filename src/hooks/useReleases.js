/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react'
import { fetchReleases } from '../api/ottIndia'

export function useReleases(language = 'all') {
  const [movies, setMovies] = useState([])
  const [tvShows, setTvShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [movieData, tvData] = await Promise.all([
        fetchReleases('movie'),
        fetchReleases('tv')
      ])
      const filterByLang = (items) => {
        if (language === 'all') return items
        return items.filter(item => item.language === language)
      }
      setMovies(filterByLang(movieData))
      setTvShows(filterByLang(tvData))
      setLastUpdated(new Date().toISOString())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [language])

  useEffect(() => {
    load()
  }, [load])

  return { movies, tvShows, loading, error, lastUpdated, refetch: load }
}
