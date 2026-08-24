import { useCallback, useEffect, useRef, useState } from 'react'
import CoverflowCarousel from './originkit/ui/coverflow-carousel'
import TechIcon from './TechIcon'
import { PROJECTS, type Project } from '../data/projects'
import { useT } from '../i18n/useT'

/*
  As medidas do carrossel são em PIXEL, não em %, porque a matemática de
  posição do componente precisa de número pra calcular onde cada lâmina para.
  Então o responsivo não pode vir de classe do Tailwind: tem que ser medido
  aqui e passado como prop.
*/
function medidas(largura: number) {
  if (largura >= 1024) {
    return {
      activeWidth: 600,
      activeHeight: 400,
      restWidth: 200,
      restHeight: 270,
      gap: 30,
      arrowSize: 56,
    }
  }
  if (largura >= 640) {
    return {
      activeWidth: 460,
      activeHeight: 360,
      restWidth: 150,
      restHeight: 220,
      gap: 22,
      arrowSize: 48,
    }
  }
  return {
    activeWidth: Math.min(largura - 40, 330),
    activeHeight: 430,
    restWidth: 84,
    restHeight: 150,
    gap: 14,
    arrowSize: 40,
  }
}

/*
  Quantas lâminas cabem INTEIRAS de cada lado. A conta é a mesma que o
  carrossel usa pra posicionar: a primeira lâmina fica a c1 do centro e as
  seguintes somam um passo. Se o lado direito dela passar da metade da tela,
  ela não cabe — e lâmina cortada no meio da palavra parece defeito.
*/
function laminasQueCabem(largura: number, t: ReturnType<typeof medidas>) {
  const c1 = t.activeWidth / 2 + t.gap + t.restWidth / 2
  const passo = t.restWidth + t.gap
  const cabem = Math.floor(1 + (largura / 2 - t.restWidth / 2 - c1) / passo)
  return Math.max(1, cabem)
}

export default function ProjectCarousel() {
  const { t } = useT()
  const [largura, setLargura] = useState(() =>
    typeof window === 'undefined' ? 1280 : window.innerWidth,
  )
  const tam = medidas(largura)
  const contador = useRef<HTMLSpanElement>(null)
  const total = PROJECTS.length

  useEffect(() => {
    const aoRedimensionar = () => setLargura(window.innerWidth)
    window.addEventListener('resize', aoRedimensionar)
    return () => window.removeEventListener('resize', aoRedimensionar)
  }, [])

  /*
    O contador é escrito direto no DOM em vez de virar state. O carrossel
    inteiro foi feito pra não re-renderizar enquanto anda — pôr um useState
    aqui traria os 8 cards de volta pro ciclo do React a cada passo, só pra
    mudar dois dígitos.
  */
  const aoMudar = useCallback(
    (i: number) => {
      if (contador.current) {
        contador.current.textContent = `${String(i + 1).padStart(2, '0')} / ${String(
          total,
        ).padStart(2, '0')}`
      }
    },
    [total],
  )

  const cartaoAtivo = useCallback(
    (p: Project) => {
      const texto = t.projects.items[p.id]
      return (
        <div className="w-full h-full flex flex-col p-7 md:p-9 text-left">
          <p className="font-mono text-[0.6rem] md:text-xs tracking-[0.2em] text-plasma">
            {texto.tag}
          </p>

          <h3 className="font-black text-2xl md:text-4xl tracking-tighter leading-[0.95] mt-3">
            {texto.name}
          </h3>

          <p className="text-sm md:text-base text-paper/70 leading-snug mt-3 md:mt-4">
            {texto.body}
          </p>

          <ul className="flex flex-wrap gap-2 mt-auto pt-5">
            {p.techs.map((tech) => (
              <li
                key={tech}
                className="flex items-center gap-2 font-mono text-[0.6rem] md:text-[0.7rem] border border-paper/25 rounded-full pl-1 pr-3 py-1 whitespace-nowrap"
              >
                <TechIcon name={tech} />
                {tech}
              </li>
            ))}
          </ul>

          {/* Só o projeto próprio tem link. Os de trabalho são da empresa. */}
          {p.url ? (
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="self-start font-mono text-xs mt-4 bg-paper text-ink rounded-full px-5 py-2 hover:bg-plasma transition-colors"
            >
              {t.projects.cta} &#8599;
            </a>
          ) : null}
        </div>
      )
    },
    [t],
  )

  const cartaoLamina = useCallback(
    (p: Project) => {
      const texto = t.projects.items[p.id]
      return (
        <div className="w-full h-full flex flex-col justify-end p-4 text-left">
          <ul className="flex flex-wrap gap-1.5 mb-3">
            {p.techs.map((tech) => (
              <li key={tech}>
                <TechIcon name={tech} />
              </li>
            ))}
          </ul>
          <h3 className="font-black text-base leading-[1.05] tracking-tight text-paper/80">
            {texto.name}
          </h3>
        </div>
      )
    },
    [t],
  )

  return (
    <div className="mt-8">
      <CoverflowCarousel
        items={PROJECTS}
        renderActive={cartaoAtivo}
        renderRest={cartaoLamina}
        activeWidth={tam.activeWidth}
        activeHeight={tam.activeHeight}
        restWidth={tam.restWidth}
        restHeight={tam.restHeight}
        gap={tam.gap}
        visibleEachSide={laminasQueCabem(largura, tam)}
        radius={24}
        arrowSize={tam.arrowSize}
        arrowPosition={95}
        cardClassName="bg-ink text-paper shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
        arrowClassName="grid place-items-center rounded-full border-2 border-ink bg-paper text-ink hover:bg-plasma hover:border-plasma transition-colors cursor-pointer"
        labelPrev={t.projects.prev}
        labelNext={t.projects.next}
        onActiveChange={aoMudar}
      />

      <span
        ref={contador}
        data-carousel-index
        className="block font-mono text-xs text-plasma-deep mt-6 px-6 md:px-12"
      />
    </div>
  )
}
