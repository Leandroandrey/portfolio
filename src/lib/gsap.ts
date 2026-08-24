import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

/*
  registerPlugin roda UMA vez, aqui. Se cada componente registrasse por conta,
  daria pra esquecer num deles e o plugin sumiria só naquela seção — bug chato
  de achar. Importe gsap DESTE arquivo, não do 'gsap' direto.
  ScrollSmoother depende do ScrollTrigger, então entra depois dele.

  Draggable, InertiaPlugin e Flip saíram quando o carrossel virou o Coverflow:
  plugin registrado é plugin embalado no bundle, mesmo sem ninguém chamar.
*/
gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  SplitText,
  ScrambleTextPlugin,
)

/*
  Archivo e Space Mono vêm do Google Fonts, ou seja: chegam DEPOIS do primeiro
  render. Quando chegam, a altura de todo texto muda e toda posição de
  ScrollTrigger medida antes vira mentira — o pin trava no lugar errado.
  O resize a página trata sozinha (refresh automático, com 200ms de debounce);
  carregamento de fonte, não.
*/
if (typeof document !== 'undefined' && 'fonts' in document) {
  document.fonts.ready.then(() => ScrollTrigger.refresh())
}

export { gsap, useGSAP, ScrollTrigger, ScrollSmoother, SplitText }
