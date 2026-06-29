import './ReleaseCard.css'

export default function ReleaseCard({ item }) {
  const { title, name, posterUrl, voteAverage, releaseDate, mediaType } = item

  const handleClick = () => {
    const searchQuery = encodeURIComponent(title || name)
    const url = mediaType === 'tv'
      ? `https://www.themoviedb.org/search?query=${searchQuery}`
      : `https://www.themoviedb.org/search?query=${searchQuery}`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <article className="release-card" onClick={handleClick}>
      <div className="poster-wrapper">
        {posterUrl ? (
          <img src={posterUrl} alt={title || name} loading="lazy" />
        ) : (
          <div className="poster-placeholder">
            <span>No Poster</span>
          </div>
        )}
        <div className="rating-badge">
          {voteAverage ? voteAverage.toFixed(1) : '—'}
        </div>
      </div>
      <div className="card-info">
        <h3 className="card-title">{title || name}</h3>
        <p className="card-date">{formatDate(releaseDate)}</p>
        <span className="media-badge">{mediaType === 'tv' ? 'TV' : 'Movie'}</span>
      </div>
    </article>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}
