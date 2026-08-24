import { useRef } from 'react'
import { gsap, useGSAP, SplitText } from '../lib/gsap'

/**
 * Título que sobe linha por linha, de trás de uma máscara.
 *
 * Três detalhes que a doc do GSAP marca como obrigatórios:
 *
 * - a animação nasce DENTRO do onSplit e é RETORNADA. Com autoSplit, o
 *   SplitText redivide o texto quando a fonte chega ou a janela muda de
 *   largura; se a animação tivesse sido criada fora, ela continuaria mirando
 *   nos elementos antigos, que já não existem.
 * - mask: 'lines' embrulha cada linha num container com overflow clip, então
 *   a linha sobe de TRÁS da máscara em vez de só aparecer.
 * - revertOnUpdate, porque o texto muda quando você troca o idioma.
 */
export default function SplitHeading({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  const el = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      SplitText.create(el.current, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'linha-split',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 115,
            duration: 0.95,
            stagger: 0.09,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: el.current,
              start: 'top 88%',
              once: true,
            },
          }),
      })
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
      <h2 key={text} ref={el} className={className}>
        {text}
      </h2>
  )
}
