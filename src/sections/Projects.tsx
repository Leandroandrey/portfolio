import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import Kicker from '../components/Kicker'
import SplitHeading from '../components/SplitHeading'
import ProjectCarousel from '../components/ProjectCarousel'
import { useT } from '../i18n/useT'

export default function Projects() {
  const root = useRef<HTMLElement>(null)
  const { t } = useT()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.projects-stage', {
          opacity: 0,
          y: 60,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.projects-stage', start: 'top 85%' },
        })
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="px-6 md:px-12 py-24 overflow-hidden">
      <Kicker
        text={t.projects.kicker}
        className="font-mono text-xs tracking-[0.3em] text-plasma-deep"
      />

      <SplitHeading
        text={t.projects.title}
        className="font-black leading-[0.9] tracking-tighter text-[clamp(2.5rem,8vw,6rem)] mt-4"
      />

      {/*
        A margem negativa desfaz o padding da seção só pro carrossel: ele
        precisa da largura inteira da tela pras lâminas das pontas terem onde
        aparecer. O texto acima continua alinhado com o resto da página.
      */}
      <div className="projects-stage -mx-6 md:-mx-12">
        <ProjectCarousel />
      </div>
    </section>
  )
}
