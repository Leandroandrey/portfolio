import { useT } from '../i18n/useT'

export default function LangToggle() {
  const { lang, setLang, t } = useT()

  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
      aria-label={t.toggle.label}
      className="fixed top-5 right-5 z-50 flex font-mono text-xs border-2 border-ink bg-paper rounded-full overflow-hidden"
    >
      <span
        aria-hidden="true"
        className={`px-4 py-2 ${lang === 'pt' ? 'bg-plasma text-ink' : 'text-smoke'}`}
      >
        PT
      </span>
      <span
        aria-hidden="true"
        className={`px-4 py-2 ${lang === 'en' ? 'bg-plasma text-ink' : 'text-smoke'}`}
      >
        EN
      </span>
    </button>
  )
}
