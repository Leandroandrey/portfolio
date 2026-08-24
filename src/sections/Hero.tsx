import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useT } from '../i18n/useT'
import HeroTerminal from '../components/HeroTerminal'
import TextCarousel from '../components/originkit/ui/text-carousel'
import TextEmerge from '../components/originkit/ui/text-emerge'
import { ROLES } from '../data/contact'

export default function Hero({ booted }: { booted: boolean }) {
  const root = useRef<HTMLElement>(null)
  const { t } = useT()

  useGSAP(
    () => {
      // Espera a tela de boot começar a sair. O nome decodifica ENQUANTO ela
      // sobe, em vez de já estar pronto quando a tela levanta.
      if (!booted) return

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      /*
        ScrambleText embaralha o texto e vai "resolvendo" ele até o final.
        Cada linha do nome é um elemento próprio porque o plugin substitui o
        textContent inteiro do alvo — com <br> dentro, ele apagaria a quebra.
      */
      const linhas = gsap.utils.toArray<HTMLElement>('.name-line')

      linhas.forEach((linha, i) => {
        const textoFinal = linha.dataset.text ?? ''

        gsap.to(linha, {
          duration: 1.3,
          ease: 'none',
          delay: i * 0.18,
          scrambleText: {
            text: textoFinal,
            // 'upperCase' é um preset do plugin: embaralha só com A-Z, então
            // o lixo tipográfico tem o mesmo peso visual do nome final e o
            // bloco não "treme" de largura enquanto resolve.
            chars: 'upperCase',
            speed: 0.5,
            revealDelay: 0.35,
          },
        })
      })

      gsap.from('.hero-line', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.9,
        // clearProps apaga os estilos inline quando a animação acaba. Sem
        // isso o GSAP deixa transform/opacity grudados no elemento pra
        // sempre — não quebra nada, mas suja o DOM e atrapalha depurar.
        clearProps: 'all',
      })
    },
    { scope: root, dependencies: [booted] },
  )

  return (
    <section
      ref={root}
      className="relative min-h-screen flex items-center px-6 md:px-12 pt-24 pb-16 overflow-hidden"
    >
      <div className="w-full flex items-center justify-between gap-16">
        <div className="relative flex-1 min-w-0">
        {/*
          O <p> continua existindo só pra carregar a classe hero-line, que é
          o alvo da animação de entrada da seção. O badge por dentro tem a
          animação dele, das letras, e as duas não se atrapalham: uma mexe no
          parágrafo, a outra nos <span> lá de dentro.
        */}
        <p className="hero-line">
          <TextCarousel
            texts={[...ROLES]}
            prefix={t.hero.rolePrefix}
            suffix={t.hero.roleSuffix}
            font={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.3em',
              lineHeight: 1.6,
            }}
            // Preto em cima do roxo. É a regra da paleta: #A050FF dá 4.71:1
            // com o preto e só 1.9:1 com o osso.
            color="#0d0d0d"
            affixColor="var(--color-plasma-deep)"
            badgeBackground="var(--color-plasma)"
            // 2.2s (o padrão do componente) deixa a palavra parada por menos
            // de 0.8s, porque entrada e saída juntas comem 1.4s. Não dá tempo
            // de ler "FULL STACK".
            intervalMs={3000}
          />
        </p>

        {/* data-text guarda o texto verdadeiro: o ScrambleText sobrescreve o
            textContent, então ler dele durante a animação daria lixo. */}
        <h1 className="font-black leading-[0.82] tracking-tighter text-[clamp(3.5rem,14vw,11rem)] mt-6">
          <span className="name-line block" data-text="LEANDRO">
            LEANDRO
          </span>
          {/* Texto grande usa o roxo claro: o limite do AA cai pra 3:1 em corpo
              display, e #A050FF dá 3.66:1 sobre o osso. É também o roxo
              exato da galáxia, o que amarra a entrada ao hero. */}
          <span className="name-line block text-plasma" data-text="GASPAR">
            GASPAR
          </span>
        </h1>

        {/*
          Sem a classe hero-line de propósito: a entrada deste parágrafo é a
          das palavras. Com as duas, ele subiria e apareceria por inteiro ao
          mesmo tempo em que as palavras nasciam uma a uma — duas animações
          disputando o mesmo elemento.

          O delay de 1s é o lugar que ele já ocupava na sequência quando era
          um hero-line (0.9 de atraso + 0.12 de stagger), pra ordem de leitura
          da tela continuar a mesma.
        */}
        <TextEmerge
          text={t.hero.lead}
          play={booted}
          delay={1}
          className="text-lg md:text-2xl max-w-2xl mt-8 leading-snug"
        />

        <p className="hero-line font-mono text-xs tracking-[0.3em] text-ink/60 mt-12">
          {t.hero.place}
        </p>

        <p className="hero-line font-mono text-xs tracking-[0.3em] mt-16 bg-ink text-paper inline-block rounded-full px-5 py-2">
          &#8595; {t.hero.scroll}
        </p>
        </div>

        {/* O painel só aparece onde sobra largura de verdade. Em telas menores
            a coluna de texto ocupa tudo e ele sairia espremido. */}
        <div className="hidden lg:block shrink-0">
          <HeroTerminal />
        </div>
      </div>
    </section>
  )
}
