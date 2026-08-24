import { useContext } from 'react'
import { LangContext } from './context'
import { dict } from './dictionary'

export function useT() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useT() precisa estar dentro de <LangProvider>')

  return { t: dict[ctx.lang], lang: ctx.lang, setLang: ctx.setLang }
}
