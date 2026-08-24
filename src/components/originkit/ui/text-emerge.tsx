import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../../../lib/gsap'

/*
  Text Emerge do OriginKit, adaptado.

  As palavras nascem do meio do parágrafo pra fora, saindo de escala zero e
  desfocadas. O que mudou do original:

  - `play`. O original anima no useEffect da montagem, e o hero daqui monta
    ESCONDIDO atrás da tela de boot: a animação inteira aconteceria antes de
    alguém clicar em ENTRAR, e a pessoa encontraria o texto já parado. Agora
    quem chama diz quando começar.

  - o estado inicial é escrito em useLayoutEffect, antes do primeiro pincel.
    `gsap.from` monta o estado inicial só quando o tween é criado, ou seja
    DEPOIS do render — dá um quadro com o texto inteiro visível antes de ele
    sumir pra poder entrar. Atrás do boot ninguém veria, mas com
    reduced-motion não existe boot.

  - o objeto `transition` virou números soltos. Ele entrava na lista de
    dependências do efeito, e objeto literal muda de referência a cada
    render — a animação reiniciava sozinha.

  - `font` e `color` saíram em favor de `className`. Aqui o tamanho do texto
    vem do Tailwind junto com o resto da página; estilo inline duplicaria
    isso num segundo lugar pra esquecer de atualizar depois.
*/

type DeOnde = 'start' | 'center' | 'end' | 'random'

type Props = {
  text: string
  className?: string
  /** Quando virar true, as palavras entram. */
  play?: boolean
  staggerFrom?: DeOnde
  duration?: number
  stagger?: number
  delay?: number
  ease?: string
}

export default function TextEmerge({
  text,
  className = '',
  play = true,
  staggerFrom = 'center',
  duration = 0.5,
  stagger = 0.03,
  delay = 0,
  ease = 'power2.out',
}: Props) {
  const raiz = useRef<HTMLParagraphElement>(null)
  const palavras = text.trim().split(/\s+/).filter(Boolean)

  const [reduzido] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  // Esconde antes do primeiro pincel. useLayoutEffect e não useEffect: o
  // segundo roda depois de pintar, e o texto piscaria inteiro.
  useLayoutEffect(() => {
    if (reduzido || !raiz.current) return
    gsap.set(raiz.current.querySelectorAll('.te-word'), { opacity: 0 })
  }, [text, reduzido])

  useEffect(() => {
    if (reduzido || !play || !raiz.current) return
    const els = raiz.current.querySelectorAll('.te-word')
    if (els.length === 0) return

    gsap.killTweensOf(els)

    /*
      fromTo e não from: `from` parte do estado atual do elemento, e o estado
      atual aqui foi escrito pelo useLayoutEffect acima (opacity 0). Dizer os
      dois lados deixa a animação independente de quem mexeu antes.
      blur(0px), não 'none' — o GSAP precisa de dois números pra interpolar.
    */
    const tween = gsap.fromTo(
      els,
      { opacity: 0, scale: 0, filter: 'blur(4px)' },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration,
        delay,
        ease,
        stagger: { each: stagger, from: staggerFrom },
        // Sem isto o filter e o transform ficam grudados no elemento pra
        // sempre. Filter em trinta <span> é camada de composição em cada um.
        clearProps: 'filter,transform,opacity',
      },
    )

    return () => {
      tween.kill()
    }
  }, [play, text, reduzido, duration, stagger, delay, ease, staggerFrom])

  return (
    <p ref={raiz} className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {palavras.map((palavra, i) => (
        <span key={`${i}-${palavra}`}>
          <span className="te-word" style={{ display: 'inline-block' }}>
            {palavra}
          </span>
          {i < palavras.length - 1 ? ' ' : null}
        </span>
      ))}
    </p>
  )
}
