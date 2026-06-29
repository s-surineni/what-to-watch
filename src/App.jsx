import { useState } from 'react'
import MediaTabs from './components/MediaTabs'
import LanguageSelector from './components/LanguageSelector'
import ReleaseList from './components/ReleaseList'
import { useReleases } from './hooks/useReleases'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('movies')
  const [language, setLanguage] = useState('all')
  const { movies, tvShows, loading, error, lastUpdated, refetch } = useReleases(language)

  const currentItems = activeTab === 'movies' ? movies : tvShows
  const label = activeTab === 'movies' ? 'Trending Movies' : 'Trending TV Shows'

  const isEmpty = !loading && !error && currentItems.length === 0

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1 className="app-title">What to Watch</h1>
          <button className="refresh-btn" onClick={refetch} aria-label="Refresh">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>
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
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="error-title">Failed to load</p>
            <p className="error-subtitle">Check your connection and try again</p>
            <button className="retry-btn" onClick={refetch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'middle' }}>
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Retry
            </button>
          </div>
        )}

        {loading && !error && (
          <div className="skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <line x1="7" y1="2" x2="7" y2="22" />
                <line x1="17" y1="2" x2="17" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="2" y1="7" x2="7" y2="7" />
                <line x1="2" y1="17" x2="7" y2="17" />
                <line x1="17" y1="17" x2="22" y2="17" />
                <line x1="17" y1="7" x2="22" y2="7" />
              </svg>
            </div>
            <p className="empty-title">No releases found</p>
            <p className="empty-subtitle">
              {language === 'hi' && "No Hindi releases available at the moment. Try English or All."}
              {language === 'te' && "No Telugu releases available at the moment. Try English or All."}
              {language === 'all' && "New releases will appear here shortly."}
            </p>
          </div>
        )}

        {!isEmpty && !error && !loading && (
          <div className="fade-in">
            <ReleaseList items={currentItems} label={label} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Watchmode & JustWatch</p>
      </footer>
    </div>
  )
}

export default App
