import { useState } from 'react'
import MediaTabs from './components/MediaTabs'
import LanguageSelector from './components/LanguageSelector'
import ReleaseList from './components/ReleaseList'
import { useReleases } from './hooks/useReleases'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('movies')
  const [language, setLanguage] = useState('all')
  const { movies, tvShows, loading, error, lastUpdated } = useReleases(language)

  const currentItems = activeTab === 'movies' ? movies : tvShows
  const label = activeTab === 'movies' ? 'Trending Movies' : 'Trending TV Shows'

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">What to Watch</h1>
        {lastUpdated && (
          <p className="last-updated">
            Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </header>

      <MediaTabs activeTab={activeTab} onChange={setActiveTab} />

      <LanguageSelector value={language} onChange={setLanguage} />

      <main className="main-content">
        {error && (
          <div className="error-state">
            <p>Failed to load releases.</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {loading && !error && (
          <div className="skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        )}

        {!loading && !error && currentItems.length === 0 && (
          <div className="empty-state">
            <p>No releases found.</p>
          </div>
        )}

        {!loading && !error && currentItems.length > 0 && (
          <ReleaseList items={currentItems} label={label} />
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Watchmode & JustWatch</p>
      </footer>
    </div>
  )
}

export default App
