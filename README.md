# Portfólio — Leandro Gaspar

Landing page pessoal. Bilíngue (PT/EN), com tela de entrada, linha do tempo,
carrossel de projetos e cursor personalizado.

## Rodar

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # gera dist/
```

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · GSAP · Framer Motion

## Algumas decisões

**Tradução com contrato de tipo.** Não usa biblioteca de i18n. O dicionário é
um `Record<Lang, Copy>`, e `Copy` é o contrato: esquecer uma chave em um dos
idiomas quebra o `tsc` em vez de deixar um buraco na tela. Os projetos são
indexados por `id` num `Record`, não numa lista, porque lista com um item a
menos passa despercebida.

**Dado que não se traduz mora fora do dicionário.** Nome de tecnologia, nome
de empresa e link são iguais nos dois idiomas — repetir isso em `pt` e `en`
seria só mais uma chance de um dos dois ficar desatualizado.

**Ícone de tecnologia com fundo calculado.** A escolha de fundo claro ou
escuro pra cada logo veio de cálculo de contraste WCAG contra os dois fundos
possíveis, não de olho. O Angular é quase preto e sumiria no escuro; o React
é ciano claro e sumiria no claro.

**Componentes do [OriginKit](https://www.originkit.dev) adaptados.** Galáxia
da entrada, coverflow dos projetos, cursor e texto rotativo. Nenhum entrou
como veio: os originais são demos de frame do Framer, e cada um precisou
virar componente de página — o carrossel teve que trocar imagem por conteúdo
sem o texto requebrar linha a cada quadro, e o cursor teve que ganhar portas
pra celular e pra `prefers-reduced-motion`.

**Movimento é opcional.** Tudo que se mexe respeita
`prefers-reduced-motion: reduce` — a tela de entrada some, o cursor
personalizado nem monta, e o texto rotativo congela.
