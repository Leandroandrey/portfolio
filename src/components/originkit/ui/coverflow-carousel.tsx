import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion'

/*
  Coverflow Carousel do OriginKit, adaptado.

  O original é uma galeria de IMAGENS: cada card renderiza uma <img>. Os
  projetos de trabalho do Leandro não podem ter print — são propriedade da
  empresa — então aqui o card é conteúdo, não foto.

  Isso cria um problema que o original não tem: texto dentro de uma caixa que
  vai de 600px a 200px de largura REFLUI a cada quadro, e ler algo que está
  requebrando linha 60 vezes por segundo é horrível. A solução são duas
  camadas de tamanho FIXO, uma do tamanho do card ativo e outra do tamanho da
  lâmina, trocando por opacidade. Nenhuma das duas muda de largura, logo
  nenhuma reflui: a caixa por fora encolhe e recorta, o texto por dentro fica
  parado.

  O que sobreviveu intacto do original: a matemática de posição (relOf /
  xForRel / blendForRel) e o motor de rAF único, que são a parte boa dele.
  O que saiu: autoplay (o painel estava Off), placeholders e os ganchos de
  render do Framer, que não existem fora do Framer.
  O que entrou: arrastar com o dedo, e seguir o foco do teclado.
*/

type Sizing = {
  restWidth: number
  restHeight: number
  activeWidth: number
  activeHeight: number
}

const RENDER_RANGE = 6

/*
  Distância com sinal do card ate o centro, dobrada em (-count/2, count/2].
  A emenda do laço cai exatamente em ±count/2, onde a opacidade já é 0 — por
  isso o teletransporte não aparece e o giro é infinito.
*/
function relOf(index: number, pos: number, count: number): number {
  let rel = (((index - pos) % count) + count) % count
  if (rel > count / 2) rel -= count
  return rel
}

/*
  Deslocamento horizontal em px. A primeira lâmina fica a meia-largura do
  ativo + gap + meia-lâmina; da segunda em diante o passo é uniforme.
*/
function xForRel(rel: number, s: Sizing, gap: number): number {
  const ar = Math.abs(rel)
  const c1 = s.activeWidth / 2 + gap + s.restWidth / 2
  const pitch = s.restWidth + gap
  const mag = ar <= 1 ? ar * c1 : c1 + (ar - 1) * pitch
  return (rel < 0 ? -1 : 1) * mag
}

// 0 no centro (tamanho ativo) -> 1 a um slot de distância (tamanho lâmina).
function blendForRel(rel: number): number {
  return Math.min(Math.abs(rel), 1)
}

function Card<T>({
  item,
  index,
  pos,
  count,
  R,
  sizing,
  gap,
  radius,
  cardClassName,
  renderActive,
  renderRest,
  onSelect,
  onFocusIn,
}: {
  item: T
  index: number
  pos: MotionValue<number>
  count: number
  R: number
  sizing: Sizing
  gap: number
  radius: number
  cardClassName: string
  renderActive: (item: T, index: number) => ReactNode
  renderRest: (item: T, index: number) => ReactNode
  onSelect: (index: number) => void
  onFocusIn: (index: number) => void
}) {
  /*
    Tudo deriva de UM único `pos`, então tamanho acompanha posição: o card
    cresce enquanto desliza pro centro e encolhe enquanto sai. useTransform
    devolvendo primitivo (não objeto) mantém isso barato e sem re-render.
  */
  const x = useTransform(pos, (p: number) =>
    xForRel(relOf(index, p, count), sizing, gap),
  )
  const opacity = useTransform(pos, (p: number) => {
    const ar = Math.abs(relOf(index, p, count))
    return ar <= R ? 1 : ar >= R + 1 ? 0 : 1 - (ar - R)
  })
  const zIndex = useTransform(pos, (p: number) =>
    Math.round(1000 - Math.abs(relOf(index, p, count)) * 100),
  )
  const width = useTransform(pos, (p: number) => {
    const a = blendForRel(relOf(index, p, count))
    return sizing.activeWidth + (sizing.restWidth - sizing.activeWidth) * a
  })
  const height = useTransform(pos, (p: number) => {
    const a = blendForRel(relOf(index, p, count))
    return sizing.activeHeight + (sizing.restHeight - sizing.activeHeight) * a
  })

  // 1 no centro, 0 na lâmina — é o que cruza as duas camadas de conteúdo.
  const foco = useTransform(
    pos,
    (p: number) => 1 - blendForRel(relOf(index, p, count)),
  )
  const opacidadeLamina = useTransform(foco, (f: number) => 1 - f)
  /*
    Só o card do centro recebe clique. Sem isso, o link do Mac Monstro
    continuaria clicável enquanto ele está lá na beirada, recortado.
  */
  const eventosAtivo = useTransform(foco, (f: number) =>
    f > 0.9 ? 'auto' : 'none',
  )

  const camada = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    x: '-50%',
    y: '-50%',
  } as const

  return (
    <motion.div
      // O cursor personalizado procura por isto: card é clicável (leva o
      // projeto pro centro) mas não é <a> nem <button>, então não apareceria
      // na lista de seletores dele sozinho.
      data-clicavel
      onClick={() => onSelect(index)}
      onFocusCapture={() => onFocusIn(index)}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        x,
        zIndex,
        opacity,
        cursor: 'pointer',
      }}
    >
      <motion.div
        className={cardClassName}
        style={{
          position: 'relative',
          x: '-50%',
          y: '-50%',
          width,
          height,
          borderRadius: radius,
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            ...camada,
            width: sizing.restWidth,
            height: sizing.restHeight,
            opacity: opacidadeLamina,
            pointerEvents: 'none',
          }}
        >
          {renderRest(item, index)}
        </motion.div>

        <motion.div
          style={{
            ...camada,
            width: sizing.activeWidth,
            height: sizing.activeHeight,
            opacity: foco,
            pointerEvents: eventosAtivo,
          }}
        >
          {renderActive(item, index)}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function ArrowButton({
  side,
  onClick,
  size,
  position,
  className,
  label,
}: {
  side: 'left' | 'right'
  onClick: () => void
  size: number
  position: number
  className: string
  label: string
}) {
  const isLeft = side === 'left'
  // 100% -> encostada na borda; 0% -> as duas se encontram no meio.
  const p = Math.max(0, Math.min(100, position))
  const inset = `calc((50% - ${size}px) * ${(100 - p) / 100})`

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={className}
      style={{
        position: 'absolute',
        top: '50%',
        [isLeft ? 'left' : 'right']: inset,
        transform: 'translateY(-50%)',
        width: size,
        height: size,
        zIndex: 2000,
      }}
    >
      <svg
        width={size * 0.4}
        height={size * 0.4}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pointerEvents: 'none' }}
      >
        {isLeft ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    </button>
  )
}

type Props<T> = {
  items: T[]
  renderActive: (item: T, index: number) => ReactNode
  renderRest: (item: T, index: number) => ReactNode
  activeWidth: number
  activeHeight: number
  restWidth: number
  restHeight: number
  gap: number
  radius: number
  /** Segundos que um passo de um slot leva. */
  duration?: number
  showArrows?: boolean
  arrowSize?: number
  arrowPosition?: number
  /** Quantas lâminas desenhar de cada lado. Ver o comentário do R abaixo. */
  visibleEachSide?: number
  arrowClassName?: string
  cardClassName?: string
  labelPrev?: string
  labelNext?: string
  onActiveChange?: (index: number) => void
}

export default function CoverflowCarousel<T>({
  items,
  renderActive,
  renderRest,
  activeWidth,
  activeHeight,
  restWidth,
  restHeight,
  gap,
  radius,
  duration = 0.3,
  showArrows = true,
  arrowSize = 56,
  arrowPosition = 95,
  visibleEachSide,
  arrowClassName = '',
  cardClassName = '',
  labelPrev = 'Anterior',
  labelNext = 'Proximo',
  onActiveChange,
}: Props<T>) {
  const prefersReducedMotion = useReducedMotion()
  const count = Math.max(1, items.length)
  const sizing: Sizing = { restWidth, restHeight, activeWidth, activeHeight }

  /*
    R é quantas lâminas ficam OPACAS de cada lado; da R+1 em diante elas já
    esmaeceram até sumir. Isso serve pra duas coisas ao mesmo tempo.

    A primeira é esconder a emenda: o laço dobra em ±count/2, e como os cards
    de lá já estão em opacidade 0, o teletransporte nunca é visto.

    A segunda é não desenhar lâmina que não cabe. Quem chama passa o número
    calculado a partir da largura da tela — sem isso, numa tela de 1440 a
    segunda lâmina fica metade pra fora e o nome do projeto aparece serrado
    no meio da palavra, que é bug quando é texto e não foto.
  */
  const R = Math.max(
    1,
    Math.min(
      RENDER_RANGE,
      Math.floor(count / 2) - 1,
      visibleEachSide ?? RENDER_RANGE,
    ),
  )

  /*
    Um rAF só, tocado por nós. Ele empurra `pos` na direção de `targetRef` em
    velocidade constante e SE DESLIGA ao chegar — parado não recalcula layout.
    Nada disso passa por state do React, então mover um card não re-renderiza
    componente nenhum.
  */
  const pos = useMotionValue(0)
  const targetRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastTRef = useRef<number | null>(null)

  const duracaoRef = useRef(duration)
  duracaoRef.current = duration
  const reducedRef = useRef(prefersReducedMotion)
  reducedRef.current = prefersReducedMotion

  const tick = useCallback(
    (t: number) => {
      const last = lastTRef.current ?? t
      // Trava o dt: uma aba que ficou escondida não pode gerar um salto.
      const dt = Math.min((t - last) / 1000, 1 / 30)
      lastTRef.current = t

      const cur = pos.get()
      const diff = targetRef.current - cur
      const dur = Math.max(0.08, duracaoRef.current)
      const step = (1 / dur) * dt

      if (reducedRef.current || Math.abs(diff) <= step) {
        pos.set(targetRef.current)
        rafRef.current = null
        lastTRef.current = null
        return
      }

      pos.set(cur + Math.sign(diff) * step)
      rafRef.current = requestAnimationFrame(tick)
    },
    [pos],
  )

  const ligar = useCallback(() => {
    if (rafRef.current == null) {
      lastTRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [tick])

  const desligar = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    lastTRef.current = null
  }, [])

  useEffect(() => desligar, [desligar])

  // A navegação mexe no ALVO, não na posição atual: cliques rápidos somam e o
  // carrossel persegue o destino mais longe sem engasgar no meio.
  const irProx = useCallback(() => {
    targetRef.current += 1
    ligar()
  }, [ligar])

  const irAnt = useCallback(() => {
    targetRef.current -= 1
    ligar()
  }, [ligar])

  const irPara = useCallback(
    (index: number) => {
      const cur = targetRef.current
      let d = index - cur
      d = ((d % count) + count) % count
      if (d > count / 2) d -= count
      targetRef.current = cur + d
      ligar()
    },
    [ligar, count],
  )

  const aoMudarRef = useRef(onActiveChange)
  aoMudarRef.current = onActiveChange

  useEffect(() => {
    let ultimo = -1
    const emitir = (p: number) => {
      const i = ((Math.round(p) % count) + count) % count
      if (i !== ultimo) {
        ultimo = i
        aoMudarRef.current?.(i)
      }
    }
    emitir(pos.get())
    return pos.on('change', emitir)
  }, [pos, count])

  /*
    O original só tem seta e teclado — no celular isso deixa o carrossel quase
    parado. O dedo mexe em `pos` direto e, ao soltar, o alvo vira o slot
    inteiro mais próximo. O limiar de 6px é o que deixa o CLIQUE passar: sem
    ele, tocar num card contaria como arrasto de 1px e o link nunca abriria.
  */
  const arrasteRef = useRef<{
    x0: number
    pos0: number
    movendo: boolean
  } | null>(null)
  const arrastouRef = useRef(false)
  const passoMedio = restWidth + gap

  const aoPressionar = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    arrastouRef.current = false
    arrasteRef.current = { x0: e.clientX, pos0: pos.get(), movendo: false }
    desligar()
  }

  const aoMover = (e: ReactPointerEvent<HTMLDivElement>) => {
    const a = arrasteRef.current
    if (!a) return
    const dx = e.clientX - a.x0
    if (!a.movendo) {
      if (Math.abs(dx) < 6) return
      a.movendo = true
      arrastouRef.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    pos.set(a.pos0 - dx / passoMedio)
  }

  const aoSoltar = () => {
    const a = arrasteRef.current
    arrasteRef.current = null
    if (!a?.movendo) return
    targetRef.current = Math.round(pos.get())
    ligar()
  }

  const aoSelecionar = useCallback(
    (index: number) => {
      if (arrastouRef.current) {
        arrastouRef.current = false
        return
      }
      irPara(index)
    },
    [irPara],
  )

  const focadoRef = useRef(false)
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (!focadoRef.current) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        irAnt()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        irProx()
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [irAnt, irProx])

  return (
    <div
      tabIndex={0}
      onMouseEnter={() => {
        focadoRef.current = true
      }}
      onMouseLeave={() => {
        focadoRef.current = false
      }}
      onFocus={() => {
        focadoRef.current = true
      }}
      onBlur={() => {
        focadoRef.current = false
      }}
      onPointerDown={aoPressionar}
      onPointerMove={aoMover}
      onPointerUp={aoSoltar}
      onPointerCancel={aoSoltar}
      style={{
        position: 'relative',
        width: '100%',
        height: activeHeight + 64,
        // Sem isso as laminas das pontas passam da viewport e a PAGINA inteira
        // ganha barra de rolagem horizontal. A folga de 64px e pra sombra do
        // card ativo nao ser cortada em cima e embaixo.
        overflow: 'hidden',
        userSelect: 'none',
        // pan-y deixa a página rolar por cima do carrossel no celular.
        touchAction: 'pan-y',
        outline: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          // Prende o z-index dos cards aqui dentro pra as setas, que são
          // irmãs desta div, continuarem por cima.
          isolation: 'isolate',
          zIndex: 0,
          /*
            Corte seco na borda funciona pra foto, não pra texto: a lâmina da
            ponta ficava com o nome do projeto serrado no meio, parecendo bug.
            A máscara dissolve em vez de cortar. Fica fora da div das setas de
            propósito — elas não podem desbotar junto.
          */
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
        }}
      >
        {items.map((item, i) => (
          <Card
            key={i}
            item={item}
            index={i}
            pos={pos}
            count={count}
            R={R}
            sizing={sizing}
            gap={gap}
            radius={radius}
            cardClassName={cardClassName}
            renderActive={renderActive}
            renderRest={renderRest}
            onSelect={aoSelecionar}
            onFocusIn={irPara}
          />
        ))}
      </div>

      {showArrows && count > 1 && (
        <>
          <ArrowButton
            side="left"
            onClick={irAnt}
            size={arrowSize}
            position={arrowPosition}
            className={arrowClassName}
            label={labelPrev}
          />
          <ArrowButton
            side="right"
            onClick={irProx}
            size={arrowSize}
            position={arrowPosition}
            className={arrowClassName}
            label={labelNext}
          />
        </>
      )}
    </div>
  )
}
