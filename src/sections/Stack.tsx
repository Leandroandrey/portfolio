import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import Kicker from '../components/Kicker'
import SplitHeading from '../components/SplitHeading'
import TechIcon from '../components/TechIcon'
import { useT } from '../i18n/useT'
import { STACK } from '../data/contact'

export default function Stack() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLUListElement>(null)
  const { t } = useT()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      /*
        A receita de scroll horizontal: a seção fica PRESA na tela (pin) e o
        scroll vertical vira deslocamento lateral da trilha (scrub).
        Só no desktop — no celular a lista simplesmente quebra em linhas.
      */
      mm.add(
        '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
        () => {
          const el = track.current
          if (!el) return

          // Função, não número: com invalidateOnRefresh o GSAP remede isso
          // no resize, senão a trilha para no lugar errado depois de girar
          // o monitor ou abrir o devtools.
          const distance = () =>
            Math.max(0, el.scrollWidth - window.innerWidth + 96)

          if (distance() <= 0) return

          gsap.to(el, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              pin: true,
              scrub: 1,
              start: 'top top',
              end: () => `+=${distance()}`,
              invalidateOnRefresh: true,
            },
          })
        },
      )

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      className="px-6 md:px-12 py-24 bg-ink text-paper overflow-hidden"
    >
      <Kicker
        text={t.stack.kicker}
        className="font-mono text-xs tracking-[0.3em] text-plasma"
      />

      <SplitHeading
        text={t.stack.title}
        className="font-black leading-[0.9] tracking-tighter text-[clamp(2.5rem,8vw,6rem)] mt-4 mb-12"
      />

      <ul ref={track} className="flex flex-wrap md:flex-nowrap gap-3 md:w-max">
        {STACK.map((tech) => (
          <li
            key={tech}
            className="flex items-center gap-3 md:gap-4 font-mono text-sm md:text-2xl pl-2 pr-5 md:pl-3 md:pr-8 py-2 md:py-3 whitespace-nowrap border-2 border-paper rounded-full"
          >
            <TechIcon name={tech} tamanho="lg" />
            {tech}
          </li>
        ))}
      </ul>
    </section>
  )
}
