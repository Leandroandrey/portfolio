import Kicker from '../components/Kicker'
import SplitHeading from '../components/SplitHeading'
import { ScrollSmoother } from '../lib/gsap'
import { useT } from '../i18n/useT'
import { CONTACT } from '../data/contact'
import euRoxo from '../img/eu-roxo.webp'

export default function Contact() {
  const { t } = useT()

  const linkClass =
    'font-mono text-sm md:text-base border-2 border-paper rounded-full px-6 py-3 hover:bg-plasma hover:text-ink hover:border-plasma transition-colors'

  /*
    O ScrollSmoother sequestra a rolagem: ele deixa a barra nativa andar e
    move o conteúdo por transform. window.scrollTo até funciona, mas pula sem
    a inércia do resto do site. Quando o smoother existe, quem manda é ele.
    Em celular e com reduced-motion ele nem é criado — daí o get() devolver
    null e o caminho nativo valer.
  */
  const aoTopo = () => {
    const smoother = ScrollSmoother.get()
    if (smoother) smoother.scrollTo(0, true)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="px-6 md:px-12 py-24 bg-ink text-paper">
      {/*
        Sem flex-1 na coluna de texto, de propósito. Com ela a coluna esticava
        até o fim da tela e o retrato ia junto pra beirada: numa tela de
        1920px o conteúdo acabava em 690px e sobravam 900px de preto no meio
        da seção. Sem flex-1 a coluna encolhe até o conteúdo e o retrato vem
        logo atrás, virando um bloco só em qualquer largura.
      */}
      <div className="flex flex-col-reverse md:flex-row md:items-center gap-12 md:gap-16">
        <div className="max-w-4xl min-w-0">
          <Kicker
            text={t.contact.kicker}
            className="font-mono text-xs tracking-[0.3em] text-plasma"
          />

          <SplitHeading
            text={t.contact.title}
            className="font-black leading-[0.9] tracking-tighter text-[clamp(2.5rem,8vw,6rem)] mt-4"
          />

          <p className="text-lg mt-6 max-w-xl">{t.contact.lead}</p>

          <div className="flex flex-wrap gap-4 mt-10">
            <a href={`mailto:${CONTACT.email}`} className={linkClass}>
              {CONTACT.email}
            </a>
            <a
              href={CONTACT.linkedin}
              target="_blank"
              rel="noreferrer"
              className={linkClass}
            >
              LINKEDIN &#8599;
            </a>
            <a
              href={CONTACT.github}
              target="_blank"
              rel="noreferrer"
              className={linkClass}
            >
              GITHUB &#8599;
            </a>
            {/*
              O telefone era texto solto embaixo, sem link. Ficava como sobra
              ao lado de três pílulas clicáveis — e no celular, que é onde
              telefone importa, não dava pra tocar pra ligar.
            */}
            <a href={`tel:${CONTACT.phoneHref}`} className={linkClass}>
              {CONTACT.phone}
            </a>
          </div>
        </div>

        <div className="shrink-0">
          <img
            src={euRoxo}
            alt={t.contact.photoAlt}
            width={512}
            height={512}
            loading="lazy"
            decoding="async"
            className="w-[clamp(9rem,22vw,16rem)] aspect-square rounded-full border-4 border-plasma"
            /*
              imageRendering: pixelated é obrigatório aqui. O navegador
              suaviza imagem redimensionada por padrão, e isso transforma
              pixel art em borrão — justamente o que o estilo não pode ter.

              Aqui NÃO vai data-speed. O parallax do ScrollSmoother aplica um
              translateY que muda conforme a página rola: o retrato ficava
              entre 28px e 5px acima do centro do texto, nunca alinhado com
              o bloco ao lado. Parallax funciona em coisa solta no fundo —
              em elemento que precisa ler como par de um texto, ele só parece
              desalinho.
            */
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      {/*
        A página acabava no ar: depois do telefone vinha espaço preto e o
        documento terminava. O rodapé ocupa a largura inteira de propósito,
        mesmo com o bloco acima sendo estreito — é a linha que dá chão pra
        seção e avisa que acabou.
      */}
      <footer className="mt-20 md:mt-28 pt-8 border-t-2 border-paper/15 flex flex-wrap items-center justify-between gap-6 font-mono text-xs tracking-[0.2em] text-paper/50">
        <p>&copy; {new Date().getFullYear()} LEANDRO GASPAR</p>

        <button
          type="button"
          onClick={aoTopo}
          className="tracking-[0.2em] hover:text-plasma transition-colors cursor-pointer"
        >
          {t.footer.toTop} &#8593;
        </button>
      </footer>
    </section>
  )
}
