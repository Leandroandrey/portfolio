import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

/**
 * Faixa de texto rolando sem fim.
 *
 * O truque do loop sem emenda: o conteúdo é duplicado e a trilha anda
 * exatamente -50%. Quando a segunda cópia chega onde a primeira começou, a
 * animação reinicia — e como as duas são idênticas, o olho não vê o corte.
 * Por isso ease precisa ser 'none': qualquer aceleração denuncia a emenda.
 */
export default function Marquee({ items }: { items: readonly string[] }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.to('.marquee-track', {
        xPercent: -50,
        duration: 24,
        ease: 'none',
        repeat: -1,
      })
    },
    { scope: root },
  )

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="overflow-hidden whitespace-nowrap bg-ink text-paper py-3 select-none"
    >
      <div className="marquee-track inline-flex will-change-transform">
        {/* Duas metades idênticas: é isso que faz o -50% emendar sem corte.
            A lista é repetida dentro de cada metade pra garantir que ela seja
            mais larga que a tela mesmo em monitor grande. */}
        {[0, 1].map((metade) => (
          <span key={metade} className="inline-flex shrink-0">
            {[0, 1].flatMap((ciclo) =>
              items.map((item) => (
                <span
                  key={`${ciclo}-${item}`}
                  className="px-6 font-black tracking-tighter text-2xl md:text-3xl"
                >
                  {item}
                  <span className="align-middle ml-6 inline-block w-2 h-2 rounded-full bg-plasma" />
                </span>
              )),
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
