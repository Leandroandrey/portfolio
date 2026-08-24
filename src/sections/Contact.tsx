import Kicker from '../components/Kicker'
import SplitHeading from '../components/SplitHeading'
import { useT } from '../i18n/useT'
import { CONTACT } from '../data/contact'
import euRoxo from '../img/eu-roxo.webp'

export default function Contact() {
  const { t } = useT()

  const linkClass =
    'font-mono text-sm md:text-base border-2 border-paper rounded-full px-6 py-3 hover:bg-plasma hover:text-ink hover:border-plasma transition-colors'

  return (
    <section className="px-6 md:px-12 py-24 bg-ink text-paper">
      <div className="flex flex-col-reverse md:flex-row md:items-center gap-12 md:gap-16">
        <div className="flex-1 min-w-0">
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
          </div>

          <p className="font-mono text-sm text-paper/70 mt-10">
            {t.contact.phoneNote}: {CONTACT.phone}
          </p>
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
              data-speed é do ScrollSmoother: o retrato sobe um pouco mais
              devagar que o texto ao lado.
            */
            style={{ imageRendering: 'pixelated' }}
            data-speed="0.92"
          />
        </div>
      </div>
    </section>
  )
}
