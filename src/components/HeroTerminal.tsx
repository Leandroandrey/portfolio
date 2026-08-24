import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useT } from '../i18n/useT'

/**
 * Painel de máquina no hero: os dispositivos ficam carregando em loop.
 *
 * É a mesma linguagem da tela de boot, mas aqui não termina nunca — a ideia é
 * que o equipamento está lá, ligado, rodando. Também é o único movimento
 * contínuo do hero depois que a entrada acaba.
 */
export default function HeroTerminal() {
  const root = useRef<HTMLDivElement>(null)
  const { t } = useT()

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap
        .timeline({ repeat: -1, repeatDelay: 1.4 })
        // cada dispositivo "resolve" 0,5s depois do anterior
        .to('.ht-dots', { autoAlpha: 0, duration: 0.12, stagger: 0.5 })
        .to('.ht-ok', { autoAlpha: 1, duration: 0.12, stagger: 0.5 }, 0.06)
        // segura o painel completo e volta ao início
        .to('.ht-ok', { autoAlpha: 0, duration: 0.35 }, '+=1.2')
        .to('.ht-dots', { autoAlpha: 1, duration: 0.35 }, '<')

      gsap.to('.ht-cursor', {
        autoAlpha: 0,
        duration: 0.45,
        repeat: -1,
        yoyo: true,
        ease: 'none',
      })
    },
    { scope: root, dependencies: [t] },
  )

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="select-none w-[clamp(17rem,26vw,22rem)] border-2 border-ink rounded-2xl overflow-hidden bg-paper"
      // data-speed é do ScrollSmoother: o painel sobe um pouco mais devagar
      // que o resto, criando profundidade.
      data-speed="0.9"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-ink">
        <span className="w-2 h-2 rounded-full bg-ink" />
        <span className="w-2 h-2 rounded-full bg-ink/40" />
        <span className="w-2 h-2 rounded-full bg-ink/40" />
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-ink/60 ml-2">
          {t.boot.done}
        </span>
      </div>

      <div className="px-4 py-4 font-mono text-[0.68rem] leading-relaxed">
        {t.boot.lines.map((line) => (
          <p key={line} className="flex justify-between gap-3 py-0.5">
            <span className="text-ink/60">&gt; {line}</span>
            <span className="relative inline-block w-8 text-right">
              <span className="ht-dots absolute right-0">···</span>
              <span className="ht-ok absolute right-0 opacity-0 font-bold">
                {t.boot.ok}
              </span>
            </span>
          </p>
        ))}
        <p className="mt-3 text-ink/60">
          &gt; <span className="ht-cursor text-plasma">_</span>
        </p>
      </div>
    </div>
  )
}
