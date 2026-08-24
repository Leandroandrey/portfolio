import type { TechName } from './tech'

/*
  Dados que NÃO se traduzem ficam fora do dicionário — repetir isso em pt e en
  seria só uma chance a mais de um dos dois ficar desatualizado.
*/
export const CONTACT = {
  email: 'leandro.andrey81@hotmail.com',
  phone: '(51) 99202-7682',
  // Formato pro href tel:, que não aceita parêntese nem espaço.
  phoneHref: '+5551992027682',
  linkedin: 'https://www.linkedin.com/in/leandroandrey/',
  github: 'https://github.com/Leandroandrey',
} as const

/*
  A lista da seção STACK é só de nomes: o logo (ou a sigla) de cada um mora no
  registro em data/tech.ts, que é o mesmo consultado pelos cards do carrossel.
  Como o tipo é TechName, um nome que não exista lá quebra o build em vez de
  render um círculo vazio.
*/
export const STACK: TechName[] = [
  'Angular',
  'React',
  'TypeScript',
  'C#',
  '.NET 8',
  'ASP.NET Core',
  '.NET MAUI',
  'SQL Server',
  'PostgreSQL',
  'XState',
  'Zustand',
  'Playwright',
  'Vitest',
  'SignalR',
  'Vite',
]

/*
  As especialidades que giram no badge do hero. Ficam aqui, e não no
  dicionário, porque a lista é IDÊNTICA nos dois idiomas — o que muda é só de
  que lado entra a palavra fixa: "DESENVOLVEDOR full stack" em português,
  "full stack DEVELOPER" em inglês. Essa palavra sim está no dicionário.
*/
export const ROLES = ['FULL STACK', 'ANGULAR', 'REACT', '.NET'] as const

// Letreiro rolando entre a timeline e a stack. Nome próprio não se traduz,
// por isso fica aqui e não no dicionário.
export const MARQUEE = [
  'PERTO S.A.',
  'MAC MONSTRO',
  'PROMETEON',
  'PIRELLI',
] as const
