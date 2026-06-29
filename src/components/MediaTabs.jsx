import './MediaTabs.css'

export default function MediaTabs({ activeTab, onChange }) {
  return (
    <div className="media-tabs" role="tablist">
      <button
        className={`tab ${activeTab === 'movies' ? 'active' : ''}`}
        onClick={() => onChange('movies')}
        role="tab"
        aria-selected={activeTab === 'movies'}
      >
        Movies
      </button>
      <button
        className={`tab ${activeTab === 'tv' ? 'active' : ''}`}
        onClick={() => onChange('tv')}
        role="tab"
        aria-selected={activeTab === 'tv'}
      >
        TV Shows
      </button>
    </div>
  )
}
