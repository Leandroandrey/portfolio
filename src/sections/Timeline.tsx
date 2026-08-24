import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import Kicker from '../components/Kicker'
import SplitHeading from '../components/SplitHeading'
import { useT } from '../i18n/useT'

// Classes inteiras num array: o scanner do Tailwind acha strings literais,
// mas NÃO acha classe montada em tempo de execução (`bg-${cor}` some do CSS).
const YEAR_STYLES = [
  'border-2 border-ink text-ink rounded-full',
  'border-2 border-ink text-ink rounded-full',
  'border-2 border-ink text-ink rounded-full',
  // 2025 é onde ele está HOJE — único preenchido E único colorido.
  'bg-plasma text-ink rounded-full',
]

export default function Timeline() {
  const root = useRef<HTMLElement>(null)
  const { t } = useT()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const rows = gsap.utils.toArray<HTMLElement>('.tl-row')

        rows.forEach((row) => {
          gsap.from(row, {
            opacity: 0,
            x: -60,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              // dispara quando o topo da linha cruza 85% da altura da janela,
              // ou seja: um pouco antes dela terminar de entrar na tela.
              start: 'top 85%',
            },
          })
        })

        /*
          scrub amarra o progresso da animação à barra de rolagem: a barra
          enche conforme você desce e ESVAZIA se você subir. Sem scrub, ela
          tocaria uma vez e ficaria cheia pra sempre.
        */
        gsap.to('.tl-progress', {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.tl-rail',
            start: 'top 70%',
            end: 'bottom 85%',
            scrub: 0.4,
          },
        })
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="px-6 md:px-12 py-24 border-t-8 border-ink">
      <Kicker text={t.timeline.kicker} className="font-mono text-xs tracking-[0.3em] text-plasma-deep" />

      <SplitHeading text={t.timeline.title} className="font-black leading-[0.9] tracking-tighter text-[clamp(2.5rem,8vw,6rem)] mt-4 mb-16" />

      <div className="tl-rail relative pl-6 md:pl-10 max-w-4xl">
        <div className="absolute left-0 top-0 w-2 h-full bg-ink/10">
          <div className="tl-progress w-full h-full bg-plasma origin-top scale-y-0" />
        </div>

        <ol>
          {t.timeline.items.map((item, i) => (
            <li
              key={item.year}
              className="tl-row grid grid-cols-[4.5rem_1fr] md:grid-cols-[8rem_1fr] gap-x-6 border-t-2 border-ink py-8"
            >
              <span
                className={`font-mono text-sm md:text-base px-2 py-1 self-start ${YEAR_STYLES[i % YEAR_STYLES.length]}`}
              >
                {item.year}
              </span>
              <div>
                <h3 className="font-bold text-xl md:text-3xl tracking-tight">
                  {item.role}
                </h3>
                <p className="text-ink/60 mt-2 max-w-xl leading-snug">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
