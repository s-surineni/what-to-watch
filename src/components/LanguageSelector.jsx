import './LanguageSelector.css'

const LANGUAGES = [
  { code: 'all', label: 'All' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'te', label: 'Telugu' }
]

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="lang-selector" role="radiogroup" aria-label="Language">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          className={`lang-btn ${value === lang.code ? 'active' : ''}`}
          onClick={() => onChange(lang.code)}
          role="radio"
          aria-checked={value === lang.code}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
