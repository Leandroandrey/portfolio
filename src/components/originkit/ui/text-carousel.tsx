import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { gsap } from '../../../lib/gsap'

/*
  Text Carousel do OriginKit, adaptado.

  Mudanças de fundo:

  - `prefix` ganhou um irmão, `suffix`. No original só existe prefixo, e isso
    não sobrevive à tradução: em português o modificador vem DEPOIS
    ("DESENVOLVEDOR full stack") e em inglês vem ANTES ("full stack
    DEVELOPER"). Com as duas pontas disponíveis, a lista que gira é a MESMA
    nos dois idiomas — só muda de que lado fica a palavra fixa.

  - o objeto `transition` virou números soltos. Ele entrava na lista de
    dependências de três useEffect, e como quem chama escreve um objeto
    literal, a referência mudava a cada render — o intervalo do rodízio era
    destruído e recriado o tempo todo. Número não tem esse problema.

  - a medição da largura do badge espera a fonte chegar. Ela é feita com
    scrollWidth, e largura de glifo depende da fonte: medir antes de a
    Archivo carregar dá um badge do tamanho errado, que só conserta no
    próximo rodízio.

  - `prefers-reduced-motion` congela o rodízio. Texto que troca sozinho a cada
    2s é exatamente o tipo de coisa que a preferência existe pra desligar.
*/

type SplitBy = 'characters' | 'words'
type StaggerFrom = 'first' | 'last' | 'center' | 'random'

type Pedaco = { chars: string[]; espacoDepois: boolean }

const mapStaggerFrom = (
  de: StaggerFrom,
): 'start' | 'end' | 'center' | 'random' =>
  de === 'first' ? 'start' : de === 'last' ? 'end' : de

// Intl.Segmenter respeita grafema: acento composto e emoji não são partidos
// no meio, coisa que Array.from(texto) faria.
const emCaracteres = (texto: string): string[] => {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter('pt', { granularity: 'grapheme' })
    return Array.from(seg.segment(texto), (p) => p.segment)
  }
  return Array.from(texto)
}

const montarPedacos = (texto: string, splitBy: SplitBy): Pedaco[] => {
  const palavras = texto.split(' ')
  return palavras.map((palavra, i) => ({
    chars: splitBy === 'characters' ? emCaracteres(palavra) : [palavra],
    espacoDepois: i !== palavras.length - 1,
  }))
}

type Props = {
  texts: string[]
  prefix?: string
  suffix?: string
  font?: CSSProperties
  color?: string
  affixColor?: string
  badgeBackground?: string
  badgePaddingX?: number
  badgePaddingY?: number
  badgeRadius?: number
  gap?: number
  splitBy?: SplitBy
  staggerFrom?: StaggerFrom
  /** Segundos de cada entrada/saída. */
  duration?: number
  /** Segundos entre uma letra e a seguinte. */
  stagger?: number
  ease?: string
  /** Milissegundos que cada texto fica parado na tela. */
  intervalMs?: number
}

export default function TextCarousel({
  texts,
  prefix = '',
  suffix = '',
  font,
  color = '#0d0d0d',
  affixColor = 'inherit',
  badgeBackground = '#A050FF',
  badgePaddingX = 12,
  badgePaddingY = 4,
  badgeRadius = 999,
  gap = 8,
  splitBy = 'characters',
  staggerFrom = 'first',
  duration = 0.45,
  stagger = 0.03,
  ease = 'power2.out',
  intervalMs = 2200,
}: Props) {
  const lista = texts.length > 0 ? texts : ['']
  const [indice, setIndice] = useState(0)
  const raizRef = useRef<HTMLSpanElement>(null)
  const conteudoRef = useRef<HTMLSpanElement>(null)
  const badgeRef = useRef<HTMLSpanElement>(null)
  const animando = useRef(false)
  const primeiraVez = useRef(true)
  const jaMediu = useRef(false)

  const [reduzido] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  /*
    Largura de glifo depende da fonte. Medir o badge antes de a Archivo/Space
    Mono chegar dá um número errado que só se corrige no rodízio seguinte —
    a mesma armadilha que já pegou o Flip do nome no hero.
  */
  const [fontesProntas, setFontesProntas] = useState(
    () =>
      typeof document === 'undefined' ||
      !('fonts' in document) ||
      document.fonts.status === 'loaded',
  )
  useEffect(() => {
    if (fontesProntas) return
    let vivo = true
    document.fonts.ready.then(() => vivo && setFontesProntas(true))
    return () => {
      vivo = false
    }
  }, [fontesProntas])

  /*
    Sem isto o rodízio gira pra sempre, inclusive com o hero fora da tela:
    um setInterval acordando o GSAP pra animar dez <span> que ninguém está
    vendo, no resto da visita inteira. O IntersectionObserver desliga.
  */
  const [visivel, setVisivel] = useState(true)
  useEffect(() => {
    const el = raizRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      ([entrada]) => setVisivel(entrada.isIntersecting),
      { rootMargin: '80px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Trocar de idioma pode encurtar a lista debaixo do índice atual.
  const seguro = Math.min(indice, lista.length - 1)
  const textoAtual = lista[seguro] ?? ''
  const pedacos = useMemo(
    () => montarPedacos(textoAtual, splitBy),
    [textoAtual, splitBy],
  )

  // ---- Rodízio -------------------------------------------------------------
  useEffect(() => {
    if (reduzido || !visivel || lista.length <= 1) return

    const id = window.setInterval(() => {
      if (animando.current) return
      const letras = conteudoRef.current?.querySelectorAll('.tc-char')
      if (!letras || letras.length === 0) {
        setIndice((i) => (i + 1) % lista.length)
        return
      }

      animando.current = true
      gsap.killTweensOf(letras)
      gsap.to(letras, {
        yPercent: -120,
        opacity: 0,
        duration,
        ease,
        stagger: { each: stagger, from: mapStaggerFrom(staggerFrom) },
        // O índice só muda quando a última letra terminou de sair: assim a
        // entrada nunca começa por cima da saída.
        onComplete: () => setIndice((i) => (i + 1) % lista.length),
      })
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [
    reduzido,
    visivel,
    lista.length,
    intervalMs,
    duration,
    stagger,
    ease,
    staggerFrom,
  ])

  // ---- Entrada -------------------------------------------------------------
  useEffect(() => {
    if (reduzido) return
    const letras = conteudoRef.current?.querySelectorAll('.tc-char')
    if (!letras || letras.length === 0) {
      animando.current = false
      return
    }

    gsap.killTweensOf(letras)
    primeiraVez.current = false
    animando.current = true

    gsap.fromTo(
      letras,
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration,
        ease,
        stagger: { each: stagger, from: mapStaggerFrom(staggerFrom) },
        onComplete: () => {
          animando.current = false
        },
      },
    )

    return () => {
      gsap.killTweensOf(letras)
    }
  }, [pedacos, reduzido, duration, stagger, ease, staggerFrom])

  // ---- Largura do badge ----------------------------------------------------
  useLayoutEffect(() => {
    const badge = badgeRef.current
    const conteudo = conteudoRef.current
    if (!badge || !conteudo) return

    /*
      letter-spacing entra DEPOIS de cada letra, inclusive a última. Sem
      descontar, o badge nasce com uns pixels a mais só do lado direito e a
      pílula fica torta. A margem negativa tira o buraco e a largura é medida
      já sem ele.
    */
    const espacamento =
      parseFloat(getComputedStyle(conteudo).letterSpacing) || 0
    conteudo.style.marginRight = espacamento ? -espacamento + 'px' : ''

    const largura = conteudo.scrollWidth - espacamento + badgePaddingX * 2
    gsap.killTweensOf(badge)

    // Na primeira medição (e quando a fonte finalmente chega) o badge assume
    // o tamanho na hora. Animar aí seria animar a partir de um valor errado.
    if (!jaMediu.current || !fontesProntas) {
      jaMediu.current = true
      gsap.set(badge, { width: largura })
      return
    }
    gsap.to(badge, { width: largura, duration, ease })
  }, [pedacos, badgePaddingX, duration, ease, fontesProntas])

  const afixo = (texto: string) =>
    texto ? (
      <span style={{ color: affixColor, whiteSpace: 'pre' }}>{texto}</span>
    ) : null

  return (
    <span
      ref={raizRef}
      style={{
        ...font,
        display: 'inline-flex',
        alignItems: 'center',
        gap,
      }}
    >
      {afixo(prefix)}

      <span
        ref={badgeRef}
        data-tc-badge
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          // O clip é o que faz as letras nascerem de baixo e sumirem em cima
          // em vez de só aparecerem.
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: badgeBackground,
          color,
          borderRadius: badgeRadius,
          padding: `${badgePaddingY}px ${badgePaddingX}px`,
          boxSizing: 'border-box',
        }}
      >
        {/* A versão em letra inteira, pra leitor de tela. O que está à vista
            é uma pilha de <span> por caractere, que seria lida letra a letra. */}
        <span
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clipPath: 'inset(50%)',
            whiteSpace: 'nowrap',
          }}
        >
          {textoAtual}
        </span>

        <span
          ref={conteudoRef}
          aria-hidden="true"
          style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}
        >
          {pedacos.map((pedaco, p) => (
            <span key={`${seguro}-${p}`} style={{ display: 'inline-flex' }}>
              {pedaco.chars.map((c, i) => (
                <span
                  key={`${seguro}-${p}-${i}`}
                  className="tc-char"
                  style={{ display: 'inline-block', willChange: 'transform' }}
                >
                  {c === ' ' ? ' ' : c}
                </span>
              ))}
              {pedaco.espacoDepois ? (
                <span style={{ whiteSpace: 'pre' }}> </span>
              ) : null}
            </span>
          ))}
        </span>
      </span>

      {afixo(suffix)}
    </span>
  )
}
