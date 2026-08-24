import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

/**
 * Rótulo técnico que se "decifra" ao entrar na tela (ScrambleText).
 *
 * revertOnUpdate é obrigatório aqui: o texto muda quando você troca o idioma,
 * e sem ele o scramble antigo continuaria vivo escrevendo a frase em português
 * por cima da inglesa.
 */
export default function Kicker({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  const el = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to(el.current, {
          duration: 1.1,
          ease: 'none',
          scrambleText: {
            text,
            chars: '01<>/[]{}#*',
            speed: 0.4,
          },
          scrollTrigger: {
            trigger: el.current,
            start: 'top 92%',
            once: true,
          },
        })
      })

      return () => mm.revert()
    },
    { dependencies: [text], revertOnUpdate: true },
  )

  /*
    key={text} é o conserto do bug de tradução.

    SplitText e ScrambleText reescrevem o conteúdo do elemento por fora do
    React. Quando o idioma muda, o revert() deles restaura o HTML que
    capturaram — em português — e o texto novo é sobrescrito.

    Com a key mudando, o React DESCARTA o nó antigo e monta um limpo. O
    plugin velho continua apontando pro nó que saiu (inofensivo) e o novo
    efeito trabalha em cima de conteúdo intacto.
  */
  return (
      <p key={text} ref={el} className={className}>
        {text}
      </p>
  )
}
