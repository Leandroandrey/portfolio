import type { TechName } from './tech'

/*
  Ordem, stack e link dos projetos. Nada aqui se traduz, então nada aqui mora
  no dicionário — o texto (nome, etiqueta e descrição) fica lá, indexado por
  este mesmo `id`.

  Só o projeto próprio tem `url`. Os de trabalho são propriedade da empresa:
  o campo ser opcional é o que impede alguém de sair colando link neles
  depois sem pensar.
*/
export type ProjectId =
  | 'mac-monstro'
  | 'autoatendimento-novo'
  | 'monitoramento'
  | 'admin-multiplataforma'
  | 'tokens'
  | 'cofre'
  | 'autoatendimento-legado'
  | 'equipamento'

export type Project = {
  id: ProjectId
  techs: TechName[]
  url?: string
}

export const PROJECTS: Project[] = [
  {
    id: 'mac-monstro',
    url: 'https://macmonstro.pages.dev',
    techs: ['React 19', 'TypeScript', 'Zustand', 'Vite', 'Cloudflare Pages'],
  },
  {
    id: 'autoatendimento-novo',
    techs: ['React 19', 'XState', 'Zustand', '.NET 8', 'PostgreSQL'],
  },
  {
    id: 'monitoramento',
    techs: ['Angular 15', 'SNMP', 'Chart.js', 'Entra ID'],
  },
  {
    id: 'admin-multiplataforma',
    techs: ['.NET MAUI', '.NET 8', 'Active Directory'],
  },
  {
    id: 'tokens',
    techs: ['Angular 19', 'Chart.js', 'Active Directory'],
  },
  {
    id: 'cofre',
    techs: ['Angular 13', '.NET 6', 'Linux'],
  },
  {
    id: 'autoatendimento-legado',
    techs: ['Angular 19', '.NET 8', 'SQL Server'],
  },
  {
    id: 'equipamento',
    techs: ['WebView2'],
  },
]
