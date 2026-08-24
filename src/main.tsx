import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './i18n/LangProvider.tsx'

/*
  O navegador restaura a posição do scroll no reload. Com uma seção usando
  `pin`, isso é veneno: o ScrollTrigger mede o espaçador durante a
  inicialização e, se a página já nasce rolada, mede errado e empurra o
  conteúdo pra fora da tela — a tela em branco que só acontece no reload.
  Além disso, com a cortina de entrada cobrindo tudo, começar no meio da
  página não faria sentido nenhum.
*/
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
)
