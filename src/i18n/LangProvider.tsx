import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LangContext } from './context'
import type { Lang } from './dictionary'

const STORAGE_KEY = 'lg.lang'

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'pt' || saved === 'en') return saved
  } catch {
    // localStorage pode lançar em aba anônima ou com cookies bloqueados.
    // Não é erro: só cai na detecção pelo navegador.
  }
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // idem: se não dá pra salvar, a escolha vale só nesta visita.
    }
  }, [])

  // Mantém o <html lang> em dia — leitor de tela usa isso pra escolher a voz.
  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
  }, [lang])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
