import type { ProjectId } from '../data/projects'

export type Lang = 'pt' | 'en'

/**
 * O tipo Copy é o contrato. Se você adicionar uma chave no `pt` e esquecer
 * no `en`, o `tsc` quebra o build — é isso que impede os dois idiomas de
 * saírem do lugar um do outro com o tempo.
 *
 * `projects.items` é um Record indexado por ProjectId, não uma lista. Com
 * lista, esquecer um projeto numa das línguas só encurtaria o array e o
 * carrossel ficaria com um card em branco; com Record, falta uma chave e o
 * build para.
 */
export type Copy = {
  hero: {
    /*
      O modificador troca de lado entre as línguas: em português vem depois do
      cargo, em inglês vem antes. Por isso são dois campos e não um — cada
      idioma preenche o que faz sentido e deixa o outro vazio.
    */
    rolePrefix: string
    roleSuffix: string
    place: string
    lead: string
    scroll: string
  }
  timeline: {
    title: string
    kicker: string
    items: { year: string; role: string; body: string }[]
  }
  stack: { title: string; kicker: string }
  projects: {
    title: string
    kicker: string
    cta: string
    prev: string
    next: string
    items: Record<ProjectId, { name: string; tag: string; body: string }>
  }
  boot: {
    lines: string[]
    waiting: string
    ok: string
    done: string
    enter: string
    loading: string
  }
  contact: {
    title: string
    kicker: string
    lead: string
    phoneNote: string
    photoAlt: string
  }
  toggle: { label: string }
}

export const dict: Record<Lang, Copy> = {
  pt: {
    hero: {
      rolePrefix: 'DESENVOLVEDOR',
      roleSuffix: '',
      place: 'GRAVATAÍ · RS · BRASIL',
      lead: 'Sete anos em automação bancária. Comecei montando as máquinas na linha de produção. Hoje escrevo o software que roda dentro delas — e os painéis que monitoram tudo isso de longe.',
      scroll: 'VER MAIS',
    },
    timeline: {
      kicker: 'DA LINHA DE PRODUÇÃO AO CÓDIGO',
      title: 'COMO EU CHEGUEI AQUI',
      items: [
        {
          year: '2019',
          role: 'Auxiliar de Montagem',
          body: 'Montava e testava com a mão os equipamentos de automação bancária, na linha de produção.',
        },
        {
          year: '2021',
          role: 'Assistente de Operações',
          body: 'Comecei a viver de log e diagnóstico de erro. Foi aqui que eu descobri que queria estar do outro lado, escrevendo o software.',
        },
        {
          year: '2023',
          role: 'Analista de Suporte e Dev Back End',
          body: 'Escrevi minhas primeiras WebAPIs em .NET, e telas em Windows Forms conversando com pinpad, impressora e scanner.',
        },
        {
          year: '2025',
          role: 'Desenvolvedor Full Stack',
          body: 'Angular e React em produção. Respondo pelas decisões de front-end do time.',
        },
      ],
    },
    stack: { kicker: 'FERRAMENTA DE TRABALHO', title: 'STACK' },
    projects: {
      kicker: 'EM PRODUÇÃO',
      title: 'O QUE EU CONSTRUÍ',
      cta: 'VER NO AR',
      prev: 'Projeto anterior',
      next: 'Próximo projeto',
      items: {
        'mac-monstro': {
          name: 'Mac Monstro',
          tag: 'PROJETO PRÓPRIO · CLIENTE REAL',
          body: 'Cardápio de hamburgueria em Gravataí. A pessoa monta o pedido na tela, vê o total somando ao vivo, e o site abre o WhatsApp da loja com a comanda já escrita. A loja já vendia por WhatsApp — em vez de mudar o jeito deles de trabalhar, fiz o site desembocar lá.',
        },
        'autoatendimento-novo': {
          name: 'Autoatendimento — nova geração',
          tag: 'NO DIA A DIA',
          body: 'Máquina de estados no fluxo da tela — o caminho do usuário tem ramo demais pra sobreviver a if aninhado.',
        },
        monitoramento: {
          name: 'Modernização de sistema de monitoramento',
          tag: 'NO DIA A DIA',
          body: 'Reconstruí um legado por dentro: migração de banco, auditoria de operadores e painel em tempo real mandando comando SNMP.',
        },
        'admin-multiplataforma': {
          name: 'Aplicações administrativas multiplataforma',
          tag: 'NO DIA A DIA',
          body: 'Login corporativo, três idiomas e relatório em PDF. Separei o repetido em DLLs que o time todo reaproveita.',
        },
        tokens: {
          name: 'Gestão e monitoramento de tokens',
          tag: 'NO DIA A DIA',
          body: 'Geração e acompanhamento de token, com gráfico interativo e três idiomas.',
        },
        cofre: {
          name: 'Cofre para gestão de numerário',
          tag: 'NO DIA A DIA',
          body: 'Entrei pra apagar incêndio em produção. Fiquei, e refiz boa parte da UX/UI.',
        },
        'autoatendimento-legado': {
          name: 'Autoatendimento — versão legada',
          tag: 'NO DIA A DIA',
          body: 'Modelei os dados, escrevi a WebAPI e o front da geração anterior do produto.',
        },
        equipamento: {
          name: 'Equipamento de automação bancária',
          tag: 'NO DIA A DIA',
          body: 'Front-end que roda dentro da máquina, falando com o software nativo por WebView2. É o mesmo tipo de equipamento que eu montava em 2019.',
        },
      },
    },
    boot: {
      lines: ['POST', 'DISPENSADOR', 'LEITOR DE CARTÃO', 'IMPRESSORA', 'REDE'],
      waiting: 'FONTES',
      ok: 'OK',
      done: 'SISTEMA PRONTO',
      enter: 'ENTRAR',
      loading: 'INICIANDO',
    },
    contact: {
      kicker: 'ONDE ME ACHAR',
      title: 'FALA COMIGO',
      lead: 'Melhor caminho é o e-mail ou o LinkedIn.',
      phoneNote: 'Telefone',
      photoAlt: 'Retrato de Leandro Gaspar em pixel art, sobre fundo roxo.',
    },
    toggle: { label: 'Mudar idioma para inglês' },
  },

  en: {
    hero: {
      rolePrefix: '',
      roleSuffix: 'DEVELOPER',
      place: 'GRAVATAÍ · BRAZIL',
      lead: 'Seven years in banking automation. I started out assembling the machines on the production line. Today I write the software that runs inside them — and the dashboards that monitor it all from a distance.',
      scroll: 'SCROLL',
    },
    timeline: {
      kicker: 'FROM THE PRODUCTION LINE TO CODE',
      title: 'HOW I GOT HERE',
      items: [
        {
          year: '2019',
          role: 'Assembly Technician',
          body: 'I assembled and tested the banking automation hardware by hand, on the production line.',
        },
        {
          year: '2021',
          role: 'Operations Assistant',
          body: 'I started living off logs and error diagnosis. This is where I realised I wanted to be on the other side, writing the software.',
        },
        {
          year: '2023',
          role: 'Support Analyst & Back-End Developer',
          body: 'I wrote my first .NET WebAPIs, and Windows Forms screens talking to pinpads, printers and scanners.',
        },
        {
          year: '2025',
          role: 'Full Stack Developer',
          body: 'Angular and React in production. I own the front-end decisions for my team.',
        },
      ],
    },
    stack: { kicker: 'TOOLS OF THE TRADE', title: 'STACK' },
    projects: {
      kicker: 'IN PRODUCTION',
      title: "WHAT I'VE BUILT",
      cta: 'VIEW LIVE',
      prev: 'Previous project',
      next: 'Next project',
      items: {
        'mac-monstro': {
          name: 'Mac Monstro',
          tag: 'OWN PROJECT · REAL CLIENT',
          body: "A burger shop menu in Gravataí, Brazil. You build your order on screen, watch the total add up live, and the site opens the shop's WhatsApp with the ticket already written. They were already selling over WhatsApp — instead of changing how they work, I made the site feed into it.",
        },
        'autoatendimento-novo': {
          name: 'Self-service terminal — new generation',
          tag: 'DAY TO DAY',
          body: 'A state machine on the screen flow — the user path branches too much to survive nested ifs.',
        },
        monitoramento: {
          name: 'Monitoring system modernization',
          tag: 'DAY TO DAY',
          body: 'Rebuilt a legacy system from the inside: database migration, operator audits, and a real-time dashboard sending SNMP commands.',
        },
        'admin-multiplataforma': {
          name: 'Cross-platform admin applications',
          tag: 'DAY TO DAY',
          body: 'Corporate sign-in, three languages and PDF reports. I pulled the repeated parts into DLLs the whole team reuses.',
        },
        tokens: {
          name: 'Token management and monitoring',
          tag: 'DAY TO DAY',
          body: 'Token generation and tracking, with interactive charts and three languages.',
        },
        cofre: {
          name: 'Cash management vault',
          tag: 'DAY TO DAY',
          body: 'I came in to put out a production fire. I stayed, and reworked much of the UX/UI.',
        },
        'autoatendimento-legado': {
          name: 'Self-service terminal — legacy version',
          tag: 'DAY TO DAY',
          body: 'I modelled the data, wrote the WebAPI and the front end for the previous generation of the product.',
        },
        equipamento: {
          name: 'Banking automation hardware',
          tag: 'DAY TO DAY',
          body: 'A front end that runs inside the machine, talking to the native software over WebView2. It is the same kind of hardware I was assembling in 2019.',
        },
      },
    },
    boot: {
      lines: ['POST', 'DISPENSER', 'CARD READER', 'PRINTER', 'NETWORK'],
      waiting: 'FONTS',
      ok: 'OK',
      done: 'SYSTEM READY',
      enter: 'ENTER',
      loading: 'STARTING',
    },
    contact: {
      kicker: 'WHERE TO FIND ME',
      title: 'GET IN TOUCH',
      lead: 'Email or LinkedIn are the best ways to reach me.',
      phoneNote: 'Phone',
      photoAlt: 'Pixel art portrait of Leandro Gaspar on a purple background.',
    },
    toggle: { label: 'Switch language to Portuguese' },
  },
}
