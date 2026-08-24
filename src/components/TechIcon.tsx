import { iconeDe, siglaDe, type TechName } from '../data/tech'

/*
  O círculo com o logo (ou a sigla) de uma tecnologia.

  O `fundo` de cada ícone não é escolha estética: veio do cálculo de contraste
  WCAG na geração do data/icons.ts. O Angular é quase preto e some no escuro;
  o React é ciano claro e some no claro. Cada logo ganha o fundo onde ele
  aparece, e é por isso que este componente existe em vez de a cor ser
  chumbada no CSS de quem chama.

  Os dois tamanhos vivem aqui como strings literais porque o Tailwind v4 lê o
  código-fonte procurando classe escrita por extenso — `w-${n}` não é achado
  pelo scanner e sairia sem estilo nenhum.
*/
const TAMANHO = {
  sm: {
    caixa: 'w-7 h-7',
    svg: 'w-3.5 h-3.5',
    sigla: 'text-[0.4rem]',
    siglaLonga: 'text-[0.32rem]',
  },
  lg: {
    caixa: 'w-8 h-8 md:w-11 md:h-11',
    svg: 'w-4 h-4 md:w-6 md:h-6',
    sigla: 'text-[0.5rem] md:text-[0.65rem]',
    siglaLonga: 'text-[0.42rem] md:text-[0.55rem]',
  },
} as const

export default function TechIcon({
  name,
  tamanho = 'sm',
}: {
  name: TechName
  tamanho?: keyof typeof TAMANHO
}) {
  const icone = iconeDe(name)
  const sigla = siglaDe(name)
  const t = TAMANHO[tamanho]

  return (
    <span
      aria-hidden="true"
      className={`grid place-items-center rounded-full shrink-0 ${t.caixa} ${
        icone && icone.fundo === 'escuro'
          ? 'bg-ink border border-paper/25'
          : 'bg-paper'
      }`}
    >
      {icone ? (
        <svg viewBox="0 0 24 24" className={t.svg} style={{ fill: icone.cor }}>
          <path d={icone.path} />
        </svg>
      ) : (
        <span
          className={`text-ink font-bold leading-none ${
            (sigla?.length ?? 0) > 3 ? t.siglaLonga : t.sigla
          }`}
        >
          {sigla}
        </span>
      )}
    </span>
  )
}
