import { useState } from 'react'
import { gsap, useGSAP, ScrollSmoother } from './lib/gsap'
import Boot from './components/Boot'
import SpinCursor from './components/originkit/ui/spin-cursor'
import LangToggle from './components/LangToggle'
import Marquee from './components/Marquee'
import { MARQUEE } from './data/contact'
import Hero from './sections/Hero'
import Timeline from './sections/Timeline'
import Stack from './sections/Stack'
import Projects from './sections/Projects'
import Contact from './sections/Contact'

export default function App() {
  // Vira true quando a tela de boot começa a subir — é o gatilho do hero.
  const [booted, setBooted] = useState(false)

  useGSAP(() => {
    const mm = gsap.matchMedia()

    /*
      Rolagem com inércia. Só no desktop: em celular o navegador já tem a
      inércia dele e o smoother briga com ela, além de pesar em aparelho fraco.
    */
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.2,
        effects: true,
      })

      return () => smoother.kill()
    })

    return () => mm.revert()
  })

  return (
    <>
      {/* position:fixed precisa ficar FORA do #smooth-wrapper, senão o
          smoother arrasta junto com o conteúdo. */}
      <Boot onDone={() => setBooted(true)} />
      <LangToggle />
      {/* Também fora do wrapper, e pelo mesmo motivo: é position:fixed.
          Dentro dele, o smoother arrastaria o cursor junto com a página e
          ele ficaria pra trás do ponteiro de verdade a cada rolagem. */}
      <SpinCursor />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main className="font-display">
            <Hero booted={booted} />
            <Timeline />
            <Marquee items={MARQUEE} />
            <Stack />
            <Projects />
            <Contact />
          </main>
        </div>
      </div>
    </>
  )
}
