import ReleaseCard from './ReleaseCard'
import './ReleaseList.css'

export default function ReleaseList({ items, label }) {
  if (!items || items.length === 0) {
    return (
      <section className="release-list">
        <h2 className="list-title">{label}</h2>
        <p className="empty-state">No releases found.</p>
      </section>
    )
  }

  return (
    <section className="release-list">
      <h2 className="list-title">{label}</h2>
      <div className="card-scroll">
        {items.map(item => (
          <ReleaseCard key={`${item.mediaType}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  )
}
