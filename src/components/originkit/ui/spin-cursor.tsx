import { useEffect, useMemo, useRef, useState } from 'react'

/*
  Spin Cursor do OriginKit, adaptado pra página inteira.

  O original é uma demo de frame do Framer: ele mede um retângulo, só desenha
  o cursor DENTRO dele, e carrega um rótulo "HOVER AROUND" no meio da tela.
  Aqui o retângulo é a janela toda, então a conta de coordenada some — o
  clientX do evento já é a posição final — e o rótulo saiu.

  Duas portas que o original não tem:

  - `(pointer: fine)`. Em celular não existe cursor. Sem isso, o toque na tela
    mandaria pointermove e uma seta apareceria correndo sozinha.
  - `prefers-reduced-motion`. Isto aqui é uma seta com mola, inércia e giro.
    Quem pediu menos movimento fica com o cursor do sistema, que é o certo.

  Nos dois casos o componente não renderiza NADA e o `cursor: none` nunca é
  injetado — o cursor nativo continua inteiro.
*/

const GLOW_CORE_PX = 6
const GLOW_BLOOM_PX = 18

// Constantes de tempo da mola. Quanto menor, mais grudado no ponteiro.
const FOLLOW_TAU = 0.02
const VELOCITY_TAU = 0.05

/*
  O que faz a seta virar anel. Precisa listar na mão porque o cursor nativo
  foi desligado com "cursor: none" — o jeito normal de descobrir isso seria
  ler o cursor computado do elemento, e agora ele responde "none" pra tudo.
  [data-clicavel] é a saída pros clicáveis que não são <a> nem <button>, como
  as lâminas do carrossel.
*/
const INTERATIVO =
  'a[href], button, input, select, textarea, summary, label, [role="button"], [data-clicavel]'

const ARROW = 'M0,0 L18,11 L9,13 L6,21 Z'
const ARROW_W = 18
const ARROW_H = 21
const ARROW_REST = Math.atan2(-15, -12)

// Menor caminho entre dois ângulos: sem isso a seta dá a volta pelo lado
// longo quando cruza o ±180°.
function angleDelta(from: number, to: number) {
  let d = (to - from) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

type Props = {
  /*
    #A050FF é a única cor da paleta que passa de 3:1 nos DOIS fundos do site
    (3,66 sobre o osso, 4,71 sobre o preto). O cursor atravessa seção clara e
    escura sem trocar de cor, então tem que ser uma só que sirva pras duas.
  */
  fillColor?: string
  strokeColor?: string
  cursorSize?: number
  enableStretch?: boolean
  enableGlow?: boolean
  glowColor?: string
  glowIntensity?: number
}

export default function SpinCursor({
  fillColor = '#A050FF',
  strokeColor = 'rgba(0,0,0,0.25)',
  cursorSize = 34,
  enableStretch = true,
  enableGlow = false,
  glowColor = '#A050FF',
  glowIntensity = 50,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const setaRef = useRef<SVGSVGElement>(null)
  const anelRef = useRef<HTMLDivElement>(null)

  /*
    Decidido uma vez, na montagem, e não num efeito: se fosse no efeito o
    cursor apareceria por um quadro em celular antes de sumir.
  */
  const [ativo] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  })

  const glowFilter = useMemo(() => {
    if (!enableGlow) return 'none'
    const t = Math.max(0, Math.min(100, glowIntensity)) / 100
    const core = (GLOW_CORE_PX * t).toFixed(2)
    const bloom = (GLOW_BLOOM_PX * t).toFixed(2)
    return `drop-shadow(0 0 ${core}px ${glowColor}) drop-shadow(0 0 ${bloom}px ${glowColor})`
  }, [enableGlow, glowColor, glowIntensity])

  // Espelho vivo: o rAF é criado uma vez só e precisa ler o valor de agora,
  // não o do primeiro render.
  const live = useRef({ cursorSize, enableStretch })
  live.current = { cursorSize, enableStretch }

  useEffect(() => {
    const host = hostRef.current
    const seta = setaRef.current
    const anel = anelRef.current
    if (!ativo || !host || !seta || !anel) return

    const tag = document.createElement('style')
    tag.textContent = `*, a, button, [role="button"] { cursor: none !important; }`

    let escondido = false
    const esconderNativo = (esconder: boolean) => {
      if (esconder === escondido) return
      escondido = esconder
      if (esconder) document.head.appendChild(tag)
      else tag.remove()
    }

    let targetX = -9999
    let targetY = -9999
    let x = targetX
    let y = targetY
    let vx = 0
    let vy = 0
    let angle = 0
    let pressed = 0
    let down = false
    let dentro = false
    let clicavel = false
    let hover = 0

    /*
      Duas cadências, e cada uma existe por um motivo.

      A rápida (60ms) responde a mexer o mouse e a rolar a página. Não pode
      ser todo quadro: elementFromPoint obriga o navegador a recalcular
      layout, e o ScrollSmoother já deixa o layout sujo o tempo todo.

      A lenta (400ms) cobre o caso em que nada disso acontece e mesmo assim o
      que está embaixo do ponteiro mudou — a tela de boot subindo depois do
      clique no ENTRAR é exatamente isso. Sem ela o anel ficava preso, aceso
      em cima do texto do hero, até a pessoa mexer o mouse.
    */
    let precisaChecar = true
    let ultimaChecagem = 0
    const marcarSujo = () => {
      precisaChecar = true
    }
    window.addEventListener('scroll', marcarSujo, {
      passive: true,
      capture: true,
    })

    const aoMover = (e: PointerEvent) => {
      // Notebook híbrido tem mouse E tela sensível ao toque. O toque não pode
      // teletransportar a seta.
      if (e.pointerType !== 'mouse') return

      /*
        Só esconde o cursor nativo DEPOIS do primeiro movimento. Injetar na
        montagem deixaria a pessoa sem cursor nenhum até ela mexer o mouse.
      */
      esconderNativo(true)

      targetX = e.clientX
      targetY = e.clientY
      precisaChecar = true
      if (!dentro) {
        // Voltou pra janela em outro canto: aparece no lugar novo em vez de
        // vir voando de onde estava.
        x = targetX
        y = targetY
        vx = 0
        vy = 0
        dentro = true
      }
    }

    const aoSair = () => {
      dentro = false
      esconderNativo(false)
    }
    const aoApertar = () => {
      down = true
    }
    const aoSoltar = () => {
      down = false
    }

    window.addEventListener('pointermove', aoMover, { passive: true })
    document.documentElement.addEventListener('pointerleave', aoSair)
    window.addEventListener('pointerdown', aoApertar, { passive: true })
    window.addEventListener('pointerup', aoSoltar, { passive: true })

    let raf = 0
    let last = performance.now()

    const quadro = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
      last = now
      const p = live.current

      // Mola exponencial: chega rápido no começo e desacelera no fim, e o
      // resultado não depende da taxa de quadros do monitor.
      const followEase = 1 - Math.exp(-dt / FOLLOW_TAU)
      const prevX = x
      const prevY = y
      x += (targetX - x) * followEase
      y += (targetY - y) * followEase

      if (dt > 0) {
        const vEase = 1 - Math.exp(-dt / VELOCITY_TAU)
        vx += ((x - prevX) / dt - vx) * vEase
        vy += ((y - prevY) / dt - vy) * vEase
      }

      const desde = now - ultimaChecagem
      if (dentro && (precisaChecar ? desde > 60 : desde > 400)) {
        ultimaChecagem = now
        precisaChecar = false
        // targetX, e nao x: quero o ponteiro de verdade, nao a mola que
        // ainda esta chegando nele.
        const sob = document.elementFromPoint(targetX, targetY)
        clicavel = !!sob?.closest(INTERATIVO)
      }

      const speed = Math.hypot(vx, vy)

      // Abaixo de 40px/s a direção é ruído puro e a seta ficaria tremendo.
      if (speed > 40) {
        const alvo = Math.atan2(vy, vx) - ARROW_REST
        angle += angleDelta(angle, alvo) * (1 - Math.exp(-dt / 0.06))
      }

      const stretch = p.enableStretch ? 1 + Math.min(speed / 3000, 0.35) : 1
      const squash = p.enableStretch ? 1 / Math.sqrt(stretch) : 1

      pressed += ((down ? 1 : 0) - pressed) * (1 - Math.exp(-dt / 0.05))
      const press = 1 - pressed * 0.2

      /*
        Em cima de algo clicável a seta some e um anel toma o lugar dela. É o
        aviso que o cursor nativo dava com a mãozinha e que o "cursor: none"
        tinha levado embora.
      */
      hover += ((clicavel ? 1 : 0) - hover) * (1 - Math.exp(-dt / 0.1))
      seta.style.opacity = String(1 - hover)
      anel.style.opacity = String(hover)

      const s = (p.cursorSize / ARROW_H) * press * (1 + hover * 0.55)
      host.style.opacity = dentro ? '1' : '0'
      host.style.transform =
        `translate(${x}px, ${y}px) ` +
        `rotate(${angle}rad) ` +
        `scale(${s * squash}, ${s * stretch})`

      raf = requestAnimationFrame(quadro)
    }
    raf = requestAnimationFrame(quadro)

    return () => {
      cancelAnimationFrame(raf)
      esconderNativo(false)
      window.removeEventListener('scroll', marcarSujo, { capture: true })
      window.removeEventListener('pointermove', aoMover)
      document.documentElement.removeEventListener('pointerleave', aoSair)
      window.removeEventListener('pointerdown', aoApertar)
      window.removeEventListener('pointerup', aoSoltar)
    }
  }, [ativo])

  if (!ativo) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        ref={hostRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transformOrigin: '0 0',
          opacity: 0,
          pointerEvents: 'none',
          willChange: 'transform',
          filter: glowFilter,
        }}
      >
        <div
          ref={anelRef}
          style={{
            position: 'absolute',
            /*
              A origem do host é a PONTA da seta, não o meio. O anel tem que
              se deslocar meia largura pra ficar centrado no ponteiro. Os
              números são da escala local (o host multiplica tudo por s).
            */
            left: -ARROW_H / 2,
            top: -ARROW_H / 2,
            width: ARROW_H,
            height: ARROW_H,
            borderRadius: '50%',
            /*
              O anel NÃO é roxo, e isso não é descuido. Todo clicável do site
              fica com fundo plasma no hover — anel roxo em cima de fundo roxo
              é anel invisível, justo no momento em que ele existe pra ser
              visto.

              Duas cores resolvem, e é o mesmo truque do cursor do sistema
              operacional: traço escuro com auréola clara em volta. Um dos
              dois sempre contrasta, seja o fundo o osso, o preto ou o roxo.
            */
            border: '1.5px solid rgba(13, 13, 13, 0.85)',
            boxShadow: '0 0 0 0.8px rgba(244, 241, 234, 0.9)',
            background: 'rgba(244, 241, 234, 0.18)',
            opacity: 0,
          }}
        />

        <svg
          ref={setaRef}
          width={ARROW_W}
          height={ARROW_H}
          viewBox={`0 0 ${ARROW_W} ${ARROW_H}`}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <path
            d={ARROW}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={0.6}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
