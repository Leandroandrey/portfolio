import { ICONS, type Icone } from './icons'

/*
  Registro de tecnologia -> logo, com a chave sendo o rótulo EXATO que aparece
  na tela. Angular 13, 15 e 19 são três entradas apontando pro mesmo desenho —
  parece repetição, mas é de propósito: assim `TechName` é um tipo fechado e
  um erro de digitação em qualquer lista de projeto quebra o `tsc` em vez de
  virar um círculo vazio que ninguém percebe.

  Quem não tem logo oficial ganha sigla. C# está aqui de novo pelo mesmo
  motivo de sempre: o ícone que as bibliotecas chamam de "C#" é o logo da
  linguagem C, que é outra coisa.
*/
export const TECH = {
  Angular: { icon: 'angular' },
  'Angular 13': { icon: 'angular' },
  'Angular 15': { icon: 'angular' },
  'Angular 19': { icon: 'angular' },
  React: { icon: 'react' },
  'React 19': { icon: 'react' },
  TypeScript: { icon: 'typescript' },
  'C#': { mono: 'C#' },
  '.NET 6': { icon: 'dotnet' },
  '.NET 8': { icon: 'dotnet' },
  'ASP.NET Core': { mono: 'ASP' },
  '.NET MAUI': { mono: 'MAUI' },
  'SQL Server': { mono: 'SQL' },
  PostgreSQL: { icon: 'postgresql' },
  XState: { icon: 'xstate' },
  Zustand: { mono: 'ZU' },
  Playwright: { mono: 'PW' },
  Vitest: { icon: 'vitest' },
  SignalR: { mono: 'SR' },
  Vite: { icon: 'vite' },
  'Chart.js': { mono: 'CH' },
  SNMP: { mono: 'SNMP' },
  'Entra ID': { mono: 'EID' },
  'Active Directory': { mono: 'AD' },
  Linux: { mono: 'LNX' },
  WebView2: { mono: 'WV2' },
  'Cloudflare Pages': { mono: 'CF' },
} as const satisfies Record<string, { icon?: string; mono?: string }>

export type TechName = keyof typeof TECH

export function iconeDe(name: TechName): Icone | undefined {
  const t: { icon?: string; mono?: string } = TECH[name]
  return t.icon ? ICONS[t.icon] : undefined
}

export function siglaDe(name: TechName): string | undefined {
  const t: { icon?: string; mono?: string } = TECH[name]
  return t.mono
}
