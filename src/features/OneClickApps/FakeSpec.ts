export interface OCA {
  id: number;
  description: string;
  name: string;
  related_guides?: string[];
  href: string;
  logo_url: string;
  summary: string;
}

export const oneClickApps: OCA[] = [
  {
    id: 12345,
    name: 'GitLab',
    description: `GitLab is a complete solution for all aspects of your software development.
      At its core, GitLab serves as your centralized Git repository. GitLab also
      features built-in tools that represent every task in your development
      workflow, from planning to testing to releasing.
      Self-hosting your software development with GitLab offers total control of
      your codebase. At the same time, its familiar interface will ease collaboration
      for you and your team. GitLab is the most popular self-hosted Git repository,
      so you'll benefit from a robust set of integrated tools and an active community.`,
    summary: '',
    related_guides: ['', ''],
    href: '',
    logo_url: ''
  }
];
