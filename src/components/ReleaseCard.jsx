import './ReleaseCard.css'

function DummyPoster({ title }) {
  const words = (title || '?').split(' ').filter(Boolean)
  const initials = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : words[0]?.slice(0, 2).toUpperCase() || '??'

  const hue = [...title].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360

  return (
    <svg
      viewBox="0 0 200 300"
      xmlns="http://www.w3.org/2000/svg"
      className="dummy-poster"
    >
      <defs>
        <linearGradient id={`grad-${hue}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue}, 40%, 20%)`} />
          <stop offset="100%" stopColor={`hsl(${hue}, 50%, 12%)`} />
        </linearGradient>
      </defs>
      <rect width="200" height="300" fill={`url(#grad-${hue})`} />
      <text
        x="100"
        y="150"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="48"
        fontWeight="700"
        fill="rgba(255,255,255,0.85)"
        fontFamily="sans-serif"
      >
        {initials}
      </text>
    </svg>
  )
}

export default function ReleaseCard({ item }) {
  const { title, name, voteAverage, releaseDate, mediaType, platform, isOriginal, posterUrl } = item

  const handleCardClick = () => {
    const searchQuery = encodeURIComponent(title || name)
    window.open(`https://www.justwatch.com/in/search?q=${searchQuery}`, '_blank', 'noopener')
  }

  return (
    <article className="release-card" onClick={handleCardClick}>
      <div className="poster-wrapper">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title || name}
            loading="lazy"
            className="poster-img"
          />
        ) : (
          <DummyPoster title={title} />
        )}
        <div className="rating-badge">
          {voteAverage ? voteAverage.toFixed(1) : '—'}
        </div>
      </div>
      <div className="card-info">
        <h3 className="card-title">{title || name}</h3>
        <p className="card-date">{formatDate(releaseDate)}</p>
        {platform && (
          <span className="platform-badge">{platform}</span>
        )}
        {isOriginal && (
          <span className="original-badge">{isOriginal}</span>
        )}
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
