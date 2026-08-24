import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useT } from '../i18n/useT'
import TwinGalaxyRings from './originkit/ui/twin-galaxy-rings'

/**
 * Tela de boot: galáxia, uma linha de status e o botão de entrar.
 *
 * Ela NÃO sai sozinha — espera o clique, pra dar tempo de olhar a galáxia.
 * O botão só habilita depois que o carregamento REAL terminou
 * (document.fonts.ready), então o "SISTEMA PRONTO" não é teatro.
 *
 * O log de dispositivos mora no painel do hero, não aqui — ter nos dois
 * lugares era repetição.
 */
export default function Boot({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const sair = useRef<() => void>(() => {})
  const [pronto, setPronto] = useState(false)
  const [gone, setGone] = useState(false)
  const { t } = useT()

  useGSAP(
    (_context, contextSafe) => {
      if (!contextSafe) return

      // Quem pediu menos movimento entra direto, sem tela nenhuma.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        onDone()
        setGone(true)
        return
      }

      document.body.style.overflow = 'hidden'

      gsap.to('.boot-cursor', {
        autoAlpha: 0,
        duration: 0.45,
        repeat: -1,
        yoyo: true,
        ease: 'none',
      })

      /*
        contextSafe: essas funções rodam depois do useGSAP (num .then() e num
        onClick). Sem ele, as animações criadas aqui ficariam fora do contexto
        e não seriam revertidas na desmontagem.
      */
      const liberar = contextSafe(() => {
        setPronto(true)
        gsap
          .timeline()
          .to('.boot-loading', { autoAlpha: 0, duration: 0.25 })
          .to('.boot-done', { autoAlpha: 1, duration: 0.3 })
          .to('.boot-enter', { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' })
      })

      sair.current = contextSafe(() => {
        document.body.style.overflow = ''
        gsap
          .timeline({ onComplete: () => setGone(true) })
          .to('.boot-ui', { autoAlpha: 0, duration: 0.3 })
          // onDone dispara AQUI, não no fim: o nome decodifica enquanto a
          // tela ainda está subindo.
          .add(onDone)
          .to(root.current, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' })
      })

      /*
        Espera o sinal real (fontes) e um tempo mínimo. O timeout de 3s é rede
        de segurança: se a fonte nunca chegar, o botão aparece assim mesmo em
        vez de prender a pessoa na tela pra sempre.
      */
      Promise.all([
        Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 3000)),
        ]),
        new Promise((resolve) => setTimeout(resolve, 1400)),
      ]).then(liberar)

      return () => {
        document.body.style.overflow = ''
      }
    },
    { scope: root },
  )

  if (gone) return null

  return (
    <div ref={root} className="fixed inset-0 z-[100] bg-ink text-paper font-mono">
      {/* Config tirada direto do playground do OriginKit. Cuidado: os rótulos
          do painel NÃO são os nomes das props —
            Scale -> distance | Inner Radius -> innerVoid
            Noise -> armThickness | Count -> armCount
          As props também não são de 0 a 1: density vai a 118 aqui.
          Coincidência boa: o roxo padrão do componente (#A050FF) é o mesmo
          plasma da nossa paleta, então as cores não brigam com o resto. */}
      <div aria-hidden="true" className="absolute inset-0">
        <TwinGalaxyRings
          background="#050A14"
          colors={['#A050FF', '#C9D6E8']}
          density={118}
          dotSize={2}
          speed={47}
          hoverSpeed={68}
          direction="cw"
          distance={3540}
          innerVoid={14}
          armThickness={100}
          armCount={5}
          tilt={{ tilt: 26, sideTilt: -8 }}
          style={{ minHeight: '100%', width: '100%', height: '100%' }}
        />
      </div>

      {/* pointer-events-none é ESSENCIAL: o componente registra pointermove e
          pointerdown no próprio host. Qualquer camada por cima intercepta
          antes e mata o hover e o clique-acelera. */}
      <div aria-hidden="true" className="absolute inset-0 bg-ink/15 pointer-events-none" />

      {/* Encostado à esquerda: no centro as partículas passam por cima das
          letras e comem a legibilidade. */}
      <div className="boot-ui relative h-full flex items-center px-8 md:px-[9vw] pointer-events-none">
        <div className="text-sm md:text-base">
          <p className="boot-loading text-paper/60 tracking-[0.2em]">
            {t.boot.loading}
            <span className="boot-cursor">···</span>
          </p>

          <p className="boot-done text-paper tracking-[0.2em] opacity-0 -mt-6">
            {t.boot.done}
            <span className="boot-cursor">_</span>
          </p>

          <button
            type="button"
            onClick={() => sair.current()}
            disabled={!pronto}
            className="boot-enter pointer-events-auto opacity-0 translate-y-3 mt-10 border-2 border-paper rounded-full px-8 py-3 tracking-[0.2em] text-xs hover:bg-plasma hover:text-ink hover:border-plasma transition-colors disabled:pointer-events-none"
          >
            {t.boot.enter} &#8594;
          </button>
        </div>
      </div>
    </div>
  )
}
